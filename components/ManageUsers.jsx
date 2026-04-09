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

const ManageUsers = ({ id }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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
        <Button type="button" variant="outline">
          invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>invite a user to colllaborate</DialogTitle>
          <DialogDescription>
            Enter the mail o the user you want to invite
          </DialogDescription>
        </DialogHeader>
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
