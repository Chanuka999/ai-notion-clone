"use client";
import { useMyPresence, useOthers } from "@liveblocks/react";
import { useEffect, useCallback, type ReactNode } from "react";
import FollowPointer from "./FollowPointer";

const LiveCursorProvider = ({ children }: { children: ReactNode }) => {
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const cursor = { x: Math.floor(e.clientX), y: Math.floor(e.clientY) };
      updateMyPresence({ cursor });
    },
    [updateMyPresence],
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerLeave]);

  return (
    <div className="relative">
      {others
        .filter((other) => other.presence.cursor !== null)
        .map(({ connectionId, presence, info }) => (
          <FollowPointer
            key={connectionId}
            info={info}
            x={presence.cursor!.x}
            y={presence.cursor!.y}
          />
        ))}
      {children}
    </div>
  );
};

export default LiveCursorProvider;
