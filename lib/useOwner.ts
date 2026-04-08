import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import React, { useEffect, useState } from "react";
import { getUserRooms } from "@/actions/actions";

function useOwner() {
  const { user } = useUser();
  const room = useRoom();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!user || !room?.id) {
      setIsOwner(false);
      return;
    }

    const loadOwnerStatus = async () => {
      try {
        const rooms = await getUserRooms();
        const isCurrentRoomOwner = rooms.some(
          (document) =>
            document.roomId === room.id && document.role === "owner",
        );

        if (isMounted) {
          setIsOwner(isCurrentRoomOwner);
        }
      } catch {
        if (isMounted) {
          setIsOwner(false);
        }
      }
    };

    loadOwnerStatus();

    return () => {
      isMounted = false;
    };
  }, [room?.id, user]);

  return isOwner;
}

export default useOwner;
