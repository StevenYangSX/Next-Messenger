import getCurrentUser from "@/app/actions/getCurrentUser";

import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    const body = await request.json();

    const { userId, isGroup, members, name } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid Data", { status: 400 });
    }

    // for group chat
    if (isGroup) {
      const newConver = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      newConver.users.forEach(async (user) => {
        if (user.email) {
          await pusherServer.trigger(user.email, "conversation:new", newConver);
        }
      });
      return NextResponse.json(newConver);
    }

    // for One-to-One User chat
    const existingConvers = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    const singleConver = existingConvers[0];

    if (singleConver) return NextResponse.json(singleConver);

    // if not found , create a new one
    const newConver = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    newConver.users.map(async (user) => {
      if (user.email) {
        await pusherServer.trigger(user.email, "conversation:new", newConver);
      }
    });

    return NextResponse.json(newConver);
  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
