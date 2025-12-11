"use client";
import React, { useTransition } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createNewDocument } from "@/actions/actions";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const NewDocumentButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const { docId } = await createNewDocument();
      router.push(`doc/${docId}`);
    });
  };

  return (
    <>
      <SignedIn>
        <Button onClick={handleCreateNewDocument} disabled={isPending}>
          {isPending ? "creating" : "New Document"}
        </Button>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button>{"Sign in to create"}</Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};

export default NewDocumentButton;
