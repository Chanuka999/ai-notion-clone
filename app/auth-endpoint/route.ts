import liveblocks from "@/lib/liveblocks";
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const userEmail =
    typeof sessionClaims?.email === "string" ? sessionClaims.email : null;

  if (!userEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { room } = await req.json();

  const session = liveblocks.prepareSession(userEmail, {
    userInfo: {
      name:
        typeof sessionClaims?.fullName === "string"
          ? sessionClaims.fullName
          : userEmail,
      email: userEmail,
      avatar:
        typeof sessionClaims?.image === "string" ? sessionClaims.image : "",
    },
  });

  const usersInRoom = await adminDb
    .collectionGroup("rooms")
    .where("userId", "==", userEmail)
    .get();

  const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);

  if (userInRoom?.exists) {
    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();

    console.log("you are authorized");

    return new Response(body, { status });
  } else {
    return NextResponse.json(
      { message: "You are not in this room" },
      { status: 403 },
    );
  }
}
