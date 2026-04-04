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

  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      roomId?: string;
      role?: RoomRole;
      userId?: string;
      createdAt?: { toDate?: () => Date };
    };

    return {
      id: doc.id,
      roomId: data.roomId ?? doc.id,
      role: data.role ?? "owner",
      userId: data.userId ?? userEmail,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    };
  });
}
