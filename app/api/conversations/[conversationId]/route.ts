import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
interface Iparams {
  conversationId?: string;
}

export async function DELETE(request: Request, { params }: { params: Iparams }) {
  try {
    const { conversationId } = params;

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingConver = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    if (!existingConver) return new NextResponse("Invalid Id", { status: 401 });

    const deleted = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    existingConver.users.forEach(async (user) => {
      if (user.email) {
        await pusherServer.trigger(user.email, "conversation:remove", existingConver);
      }
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    console.log(error, "ERROR_CONVERSATION_DELETE");
    return new NextResponse("Internal Error at DELETE", { status: 500 });
  }
}
