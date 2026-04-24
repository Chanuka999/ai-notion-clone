"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteUserToDocument } from "@/actions/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import useOwner from "@/lib/useOwner";
import { collectionGroup, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/firebase";

const ManageUsers = ({ id, buttonVariant = "default" }) => {
  const { user } = useUser();
  const room = useRoom();
  const [isPending, startTransition] = useTransition();
  const isOwner = useOwner();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [usersInRoom] = useCollection(
    user && query(collectionGroup(db, "rooms"), where("roomId", "==", room.id)),
  );

  const handleInvite = async (e) => {
    e.preventDefault();

    const nextEmail = email.trim();
    if (!nextEmail) {
      setError("Email is required");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const result = await inviteUserToDocument(id, nextEmail);

        if (!result.success) {
          setError("Failed to send invite");
          return;
        }

        setEmail("");
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent("documents:refresh"));
        router.refresh();
      } catch (inviteError) {
        const message =
          inviteError instanceof Error
            ? inviteError.message
            : "Failed to send invite";
        setError(message);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={buttonVariant}
          className="bg-neutral-900 text-white hover:bg-neutral-800"
        >
          users ({usersInRoom?.docs.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>users with access</DialogTitle>
          <DialogDescription>
            Below is a list of users who have access to this document
          </DialogDescription>
        </DialogHeader>

        <hr className="my-2" />

        <div className="flex flex-col space-y-2">
          {usersInRoom?.docs.map((doc) => (
            <div
              key={doc.data().userId}
              className="flex items-center justify-between"
            >
              <p className="font-light">
                {doc.data().userId === user?.emailAddresses[0].toString()
                  ? `You (${doc.data().userId})`
                  : doc.data().userId}
              </p>
            </div>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={!email || isPending}>
            {isPending ? "Inviting.." : "Invite"}
          </Button>
        </form>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default ManageUsers;
