import React from "react";

type Props = {
  children: React.ReactNode;
};

const ProfileLayout = ({ children }: Props) => {
  return (
    <div className="h-full w-full flex flex-col text-white">
      {children}
    </div>
  );
};

export default ProfileLayout;
