import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

const DocLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
};

export default DocLayout;
