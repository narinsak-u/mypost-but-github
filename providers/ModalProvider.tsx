"use client";

import { useEffect, useState } from "react";
import PostDrawer from "@/components/PostDrawer";

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
    </>
  );
};

export default ModalProvider;
