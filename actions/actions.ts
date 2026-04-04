"use server";

import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { FieldValue } from "firebase-admin/firestore";

export async function createNewDocument() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const userEmail = sessionClaims?.email as string;

  if (!userEmail) {
    throw new Error("User email not found in session claims");
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
    });

  return { docId: docRef.id };
}
