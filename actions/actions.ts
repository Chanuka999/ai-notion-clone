"use server";

import { adminDb } from "@/firebase-admin";
import { auth, currentUser } from "@clerk/nextjs/server";
import { FieldValue } from "firebase-admin/firestore";

type RoomRole = "owner" | "editor";

export type UserRoom = {
  id: string;
  roomId: string;
  role: RoomRole;
  userId: string;
  createdAt: string | null;
  title: string;
};

export async function createNewDocument() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Doc",
  });

  await adminDb
    .collection("users")
    .doc(userEmail)
    .collection("rooms")
    .doc(docRef.id)
    .set({
      userId: userEmail,
      role: "owner",
      createdAt: FieldValue.serverTimestamp(),
      roomId: docRef.id,
    });

  return { docId: docRef.id };
}

export async function getDocumentTitle(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  const documentSnapshot = await adminDb
    .collection("documents")
    .doc(docId)
    .get();

  if (!documentSnapshot.exists) {
    throw new Error("Document not found");
  }

  const data = documentSnapshot.data() as { title?: string };

  return {
    id: documentSnapshot.id,
    title: data.title ?? "Untitled",
  };
}

export async function updateDocumentTitle(docId: string, title: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  const nextTitle = title.trim();

  if (!nextTitle) {
    throw new Error("Title cannot be empty");
  }

  const documentRef = adminDb.collection("documents").doc(docId);
  const documentSnapshot = await documentRef.get();

  if (!documentSnapshot.exists) {
    throw new Error("Document not found");
  }

  await documentRef.update({ title: nextTitle });

  return { id: docId, title: nextTitle };
}

export async function deleteDocument(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  const roomSnapshot = await adminDb
    .collectionGroup("rooms")
    .where("roomId", "==", docId)
    .where("userId", "==", userEmail)
    .get();

  const isOwner = roomSnapshot.docs.some((roomDoc) => {
    const data = roomDoc.data() as { role?: RoomRole };
    return data.role === "owner";
  });

  if (!isOwner) {
    throw new Error("Forbidden");
  }

  const allRoomEntries = await adminDb
    .collectionGroup("rooms")
    .where("roomId", "==", docId)
    .get();

  const batch = adminDb.batch();

  allRoomEntries.docs.forEach((roomDoc) => {
    batch.delete(roomDoc.ref);
  });

  batch.delete(adminDb.collection("documents").doc(docId));

  await batch.commit();

  return { id: docId };
}

export async function getUserRooms(): Promise<UserRoom[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  const snapshot = await adminDb
    .collection("users")
    .doc(userEmail)
    .collection("rooms")
    .get();

  const roomIds = snapshot.docs.map((roomDoc) => roomDoc.id);
  const titleMap = new Map<string, string>();

  if (roomIds.length > 0) {
    const chunkSize = 10;

    for (let index = 0; index < roomIds.length; index += chunkSize) {
      const idsChunk = roomIds.slice(index, index + chunkSize);
      const docsSnapshot = await adminDb
        .collection("documents")
        .where("__name__", "in", idsChunk)
        .get();

      docsSnapshot.forEach((documentDoc) => {
        const data = documentDoc.data() as { title?: string };
        titleMap.set(documentDoc.id, data.title ?? "Untitled");
      });
    }
  }

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as {
        roomId?: string;
        role?: RoomRole;
        userId?: string;
        createdAt?: { toDate?: () => Date };
      };

      const roomId = data.roomId ?? doc.id;
      const title = titleMap.get(roomId);

      if (!title) {
        return null;
      }

      return {
        id: doc.id,
        roomId,
        role: data.role ?? "owner",
        userId: data.userId ?? userEmail,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
        title,
      };
    })
    .filter((room): room is UserRoom => room !== null);
}

export async function inviteUserToDocument(roomId: string, email: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const inviterEmail = user?.primaryEmailAddress?.emailAddress;

  if (!inviterEmail) {
    throw new Error("User email not found");
  }

  const invitedEmail = email.trim().toLowerCase();

  if (!invitedEmail) {
    throw new Error("Email is required");
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitedEmail);
  if (!isEmailValid) {
    throw new Error("Invalid email");
  }

  if (invitedEmail === inviterEmail.toLowerCase()) {
    throw new Error("You cannot invite yourself");
  }

  const ownerRoomDoc = await adminDb
    .collection("users")
    .doc(inviterEmail)
    .collection("rooms")
    .doc(roomId)
    .get();

  if (!ownerRoomDoc.exists) {
    throw new Error("Room not found");
  }

  const ownerRoomData = ownerRoomDoc.data() as { role?: RoomRole };
  if (ownerRoomData.role !== "owner") {
    throw new Error("Forbidden");
  }

  await adminDb
    .collection("users")
    .doc(invitedEmail)
    .collection("rooms")
    .doc(roomId)
    .set(
      {
        userId: invitedEmail,
        role: "editor",
        createdAt: FieldValue.serverTimestamp(),
        roomId,
      },
      { merge: true },
    );

  return { success: true };
}
