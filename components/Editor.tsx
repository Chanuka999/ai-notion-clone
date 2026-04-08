"use client";
import { useRoom, useSelf } from "@liveblocks/react";
import React, { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import type { Awareness } from "y-protocols/awareness";
import stringToColor from "@/lib/stringToColor";

type BlockNoteCollaborationProvider = {
  awareness?: Awareness;
};

type EditorProps = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
};

const BlockNote = ({ doc, provider, darkMode }: EditorProps) => {
  const userInfo = useSelf((me) => me.info);
  const editor: BlockNoteEditor = useCreateBlockNote(
    {
      collaboration: {
        provider: provider as unknown as BlockNoteCollaborationProvider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: userInfo?.name || userInfo?.email || "Guest",
          color: stringToColor(userInfo?.email || userInfo?.name),
        },
      },
    },
    [doc, provider, userInfo?.email, userInfo?.name],
  );

  return (
    <div className="relative max-w-6xl mx-auto text-left" dir="ltr">
      <BlockNoteView
        className="min-h-screen"
        editor={editor}
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
};

const Editor = () => {
  const room = useRoom();
  const [darkMode, setDarkMode] = useState(false);

  const { doc, provider } = useMemo(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    return { doc: yDoc, provider: yProvider };
  }, [room]);

  useEffect(() => {
    return () => {
      doc.destroy();
      provider.destroy();
    };
  }, [doc, provider]);

  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700"
  }`;
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        {/*TranslationDocument AI */}

        {/*ChatToDocument AI */}

        {/*Dark mode */}
        <Button className={style} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>

      {/*BlockNote */}
      <BlockNote doc={doc} provider={provider} darkMode={darkMode} />
    </div>
  );
};

export default Editor;
