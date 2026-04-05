"use client";
import React, { useCallback, useEffect, useState } from "react";
import NewDocumentButton from "./NewDocumentButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { getUserRooms, UserRoom } from "@/actions/actions";
import SidebarOption from "./SidebarOption";

interface RoomDocument extends UserRoom {
  id: string;
  createdAt: string | null;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

const Sidebar = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({
    owner: [],
    editor: [],
  });

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rooms = await getUserRooms();
      const ownerDocs: RoomDocument[] = [];
      const editorDocs: RoomDocument[] = [];

      rooms.forEach((room) => {
        if (room.role === "owner") {
          ownerDocs.push(room);
        } else {
          editorDocs.push(room);
        }
      });

      setGroupedData({ owner: ownerDocs, editor: editorDocs });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const handleDocumentsRefresh = () => {
      loadRooms();
    };

    window.addEventListener("documents:refresh", handleDocumentsRefresh);

    return () => {
      window.removeEventListener("documents:refresh", handleDocumentsRefresh);
    };
  }, [loadRooms]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDocumentCreated = useCallback(
    async (_docId: string) => {
      await loadRooms();
    },
    [loadRooms],
  );

  const menuOptions = (
    <>
      <NewDocumentButton onCreated={handleDocumentCreated} />

      {loading && <p className="text-sm text-gray-500">Loading documents...</p>}
      {error && (
        <p className="text-sm text-red-500">
          Failed to load documents: {error}
        </p>
      )}

      <div className="flex py-4 flex-col space-y-4 md:max-w-36">
        {/*my documents*/}
        {!loading && !error && groupedData.owner.length === 0 ? (
          <h2 className="text-gray-500 font-semibold text-50">
            No document found
          </h2>
        ) : (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              My Documents
            </h2>
            {groupedData.owner.map((doc) => (
              <SidebarOption
                key={doc.id}
                href={`/doc/${doc.id}`}
                title={doc.title}
              />
            ))}
          </>
        )}
      </div>

      {/*shared with me */}
      {groupedData.editor.length > 0 && (
        <>
          <h2 className="text-gray-500 font-semibold text-sm">
            Shared with me
          </h2>
          {groupedData.editor.map((doc) => (
            <SidebarOption
              key={doc.id}
              href={`/doc/${doc.id}`}
              title={doc.title}
            />
          ))}
        </>
      )}

      {/*List */}
    </>
  );

  return (
    <div className="p-2 md:p-5 bg-gray-300 relative">
      <div className="md:hidden">
        {mounted ? (
          <Sheet>
            <SheetTrigger>
              <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <div>{menuOptions}</div>
                <div></div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        ) : (
          <button
            type="button"
            className="p-2 rounded-lg"
            aria-label="Open menu"
          >
            <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
          </button>
        )}
      </div>
      <div className="hidden md:inline">{menuOptions}</div>
    </div>
  );
};

export default Sidebar;
