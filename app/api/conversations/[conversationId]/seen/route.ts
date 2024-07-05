import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
interface Iparams {
  conversationId?: string;
}

export async function POST(request: Request, { params }: { params: Iparams }) {
  try {
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //find the existing conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    if (!conversation) {
      return new NextResponse("Invalid Conversation ID", { status: 400 });
    }

    //find the last message of the existing conversation
    const lastMessage = conversation.messages.at(-1);

    if (!lastMessage) return NextResponse.json(conversation);

    //update seen of lasat message
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    });

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    await pusherServer.trigger(conversationId!, "message:update", updatedMessage);
    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    console.log(error, "ERROR_MESSAGES_SEEN");
    return new NextResponse("Internal Error at seen", { status: 500 });
  }
}
