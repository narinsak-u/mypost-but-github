"use client";

import { useSyncExternalStore } from "react";
import PostDrawer from "@/components/PostDrawer";
import ChatDialog from "@/components/chat/ChatDialog";

type Props = Record<string, never>;

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const ModalProvider = (props: Props) => {
  const isMounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

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
