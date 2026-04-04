"use client";
import React, { useEffect, useState } from "react";
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

interface RoomDocument extends UserRoom {
  id: string;
  createdAt: string | null;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

const Sidebar = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({
    owner: [],
    editor: [],
  });

  useEffect(() => {
    const loadRooms = async () => {
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
    };

    loadRooms();
  }, []);

  const menuOptions = (
    <>
      <NewDocumentButton />

      {loading && <p className="text-sm text-gray-500">Loading documents...</p>}
      {error && (
        <p className="text-sm text-red-500">
          Failed to load documents: {error}
        </p>
      )}

      {/*my documents*/}
      {!loading && !error && groupedData.owner.length === 0 ? (
        <h2 className="text-gray-500 font-semibold text-50">
          No document found
        </h2>
      ) : (
        <>
          <h2 className="text-gray-500 font-semibold text-sm">My Documents</h2>
          {groupedData.owner.map((doc) => (
            <p key={doc.id}>{doc.roomId}</p>
          ))}
        </>
      )}
      {/*List */}

      {/*shared with me */}

      {/*List */}
    </>
  );

  return (
    <div className="p-2 md:p-5 bg-gray-300 relative">
      <div className="md:hidden">
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
      </div>
      <div className="hidden md:inline">{menuOptions}</div>
    </div>
  );
};

export default Sidebar;
