"use client";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { getDocumentTitle, updateDocumentTitle } from "@/actions/actions";
import { useRouter } from "next/navigation";
import Editor from "./Editor";
import useOwner from "@/lib/useOwner";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import ManageUsers from "./ManageUsers";
import Avatars from "./Avatars";

const Document = ({ id }: { id: string }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, startTransition] = useTransition();
  const router = useRouter();
  const isOwner = useOwner();

  useEffect(() => {
    let isMounted = true;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const documentData = await getDocumentTitle(id);

        if (isMounted) {
          setInput(documentData.title);
        }
      } catch (loadError) {
        if (isMounted) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Failed to load document title";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const updateTitle = (e: FormEvent) => {
    e.preventDefault();

    const nextTitle = input.trim();

    if (nextTitle) {
      startTransition(async () => {
        await updateDocumentTitle(id, nextTitle);
        setInput(nextTitle);
        window.dispatchEvent(
          new CustomEvent("documents:refresh", {
            detail: { docId: id },
          }),
        );
        router.refresh();
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 pb-5 w-full">
        <form className="flex items-center gap-2" onSubmit={updateTitle}>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Document title"
            disabled={loading || isUpdating}
          />

          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "updating" : "update"}
          </Button>

          {isOwner && (
            <>
              <InviteUser id={id} />
              <DeleteDocument id={id} />
            </>
          )}
        </form>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Users and Avatars section above editor */}
      <div className="flex max-w-6xl mx-auto justify-start items-center mb-5 gap-4">
        <ManageUsers id={id} buttonVariant="default" />
        <Avatars />
      </div>
      <hr className="my-5" />
      {/*collaborative editors */}
      <Editor />
    </div>
  );
};

export default Document;
