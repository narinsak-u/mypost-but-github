"use client";

import { useEffect, useState } from "react";
import PostDrawer from "@/components/PostDrawer";
import ChatDialog from "@/components/chat/ChatDialog";

type Props = {};

const ModalProvider = (props: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <PostDrawer />
      <ChatDialog />
    </>
  );
};

export default ModalProvider;
