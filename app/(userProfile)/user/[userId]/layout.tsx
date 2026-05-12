import React from "react";

type Props = {
  children: React.ReactNode;
};

const ProfileLayout = ({ children }: Props) => {
  return (
    <div className="h-full w-full flex flex-col text-white">
      <div className="h-full w-full grid grid-cols-3 lg:grid-cols-4 mx-auto">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
