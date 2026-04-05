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
