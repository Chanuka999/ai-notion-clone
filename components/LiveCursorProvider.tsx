"use client";
import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useEffect, useCallback, useRef, type ReactNode } from "react";
import FollowPointer from "./FollowPointer";

const LiveCursorProvider = ({ children }: { children: ReactNode }) => {
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  const frameRef = useRef<number | null>(null);
  const pendingCursorRef = useRef<{ x: number; y: number } | null>(null);

  const flushCursorUpdate = useCallback(() => {
    frameRef.current = null;
    updateMyPresence({ cursor: pendingCursorRef.current });
  }, [updateMyPresence]);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      pendingCursorRef.current = {
        x: Math.floor(e.clientX),
        y: Math.floor(e.clientY),
      };

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(flushCursorUpdate);
      }
    },
    [flushCursorUpdate],
  );

  const handlePointerLeave = useCallback(() => {
    pendingCursorRef.current = null;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    window.requestAnimationFrame(() => {
      updateMyPresence({ cursor: null });
    });
  }, [updateMyPresence]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
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
