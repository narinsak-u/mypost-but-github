'use client';

import React from "react";
import Footer from "../Footer";

type Props = {
  children: React.ReactNode;
};

const MainContent = ({ children }: Props) => {
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="rounded-sm p-10">{children}</div>
      <Footer />
    </div>
  );
};

export default MainContent;
