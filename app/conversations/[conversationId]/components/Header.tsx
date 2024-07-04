"use client";

import Avatar from "@/app/components/Avatar";
import useOtherUser from "@/app/hooks/useOtherUser";
import { Conversation, User } from "@prisma/client";
import Link from "next/link";
import { useMemo } from "react";
import { HiChevronLeft, HiOutlineEllipsisHorizontal } from "react-icons/hi2";

interface HeaderProps {
  conversation: Conversation & {
    users: User[];
  };
}
const Header: React.FC<HeaderProps> = ({ conversation }) => {
  console.log("check pops...", conversation);
  const otherUser = useOtherUser(conversation);
  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }

    return "Active";
  }, [conversation]);

  return (
    <div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
      <div className="flex gap-3 items-center">
        <Link
          className="lg:hidden block text-sky-800 hover:text-sky-600 transition cursor-pointer"
          href="/conversations"
        >
          <HiChevronLeft size={32} />
        </Link>
        <Avatar user={otherUser} />
        <div className="flex flex-col">{conversation.name || otherUser.name}</div>
        <div className="text-sm font-light text-neutral-500">{statusText}</div>
      </div>
      <HiOutlineEllipsisHorizontal
        className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
        size={32}
        onClick={() => {}}
      />
    </div>
  );
};

export default Header;
