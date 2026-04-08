"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDocument } from "@/actions/actions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DeleteDocument = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const handleDelete = () => {
    startTransition(async () => {
      await deleteDocument(id);

      window.dispatchEvent(new CustomEvent("documents:refresh"));
      router.push("/");
      router.refresh();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to Delete?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            document and remove it from your workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDocument;
