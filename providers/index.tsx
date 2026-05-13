"use client";

import { Toaster } from "@/components/ui/sonner";
import ModalProvider from "./ModalProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-left" />
      <ModalProvider />
    </QueryClientProvider>
  );
};

export default Providers;
