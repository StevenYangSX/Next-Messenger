"use client";

import { User } from "@prisma/client";
import Image from "next/image";
interface AvatarProps {
  users?: User[];
}
const AvatarGroup: React.FC<AvatarProps> = ({ users = [] }) => {
  const slicedUSers = users.slice(0, 3);

  const positionMap = {
    0: "top-0 left-[12px]",
    1: "bottom-0",
    2: "bottom-0 right-0",
  };

  return (
    <div className="relative h-11 w-11">
      {slicedUSers.map((user, index) => (
        <div
          key={user.id}
          className={`absolute inline-block rounded-full overflow-hidden h-[21px] w-[21px] ${
            positionMap[index as keyof typeof positionMap]
          }`}
        >
          <Image alt="Avatar" fill src={user?.image || "/images/default_avatar.jpg"} />
        </div>
      ))}
    </div>
  );
};

export default AvatarGroup;
