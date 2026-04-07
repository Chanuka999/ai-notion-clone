"use client";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { getDocumentTitle, updateDocumentTitle } from "@/actions/actions";
import { useRouter } from "next/navigation";
import Editor from "./Editor";

const Document = ({ id }: { id: string }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, startTransition] = useTransition();
  const router = useRouter();

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
    <div>
      <div className="flex max-w-6xl mx-auto justify-between pb-5">
        <form className="flex flex-1 space-x-2" onSubmit={updateTitle}>
          {/*update title.. */}
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

          {error && <p className="text-sm text-red-500">{error}</p>}
          {/*if */}

          {/*isover and inviteuser,delete document */}
        </form>
      </div>

      <div>
        {/*manageusers */}

        {/*avatars */}
      </div>

      <hr className="pb-10" />
      {/*collaborative editors */}
      <Editor />
    </div>
  );
};

export default Document;
