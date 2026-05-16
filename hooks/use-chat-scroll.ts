import { useEffect, useState } from "react";

interface UseChatScrollProps {
  chatRef: React.RefObject<HTMLDivElement | null>;
  count: number;
  shouldScroll: boolean;
}

export const useChatScroll = ({
  chatRef,
  count,
  shouldScroll,
}: UseChatScrollProps) => {
  const [hasInitialized, setHasInitialied] = useState(false);

  useEffect(() => {
    const bottomDiv = chatRef?.current;

    const handleAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialied(true);
        return true;
      }

      if (!bottomDiv) return false;

      const distanceFromBottom =
        bottomDiv.scrollHeight - bottomDiv.scrollTop - bottomDiv.clientHeight;

      return distanceFromBottom <= 100;
    };

    if (shouldScroll && handleAutoScroll()) {
      setTimeout(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [count, shouldScroll, chatRef, hasInitialized]);
};
