import React from "react";

type Props = {
  children: React.ReactNode;
};

const PostContentLayout = ({ children }: Props) => {
  return (
    <div className="h-full w-full flex flex-col text-white">
      {children}
    </div>
  );
};

export default PostContentLayout;
