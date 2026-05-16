"use client";

import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

const formatRelativeLocale = {
  lastWeek: "eeee 'at' p",
  yesterday: "'Yesterday at' p",
  today: "p",
  other: "MM/dd/yy",
};

export const useFormatDate = () => {
  // Format date
  const dateFormate = (date: Date) => {
    const formatedDate = formatRelative(date, new Date(), {
      locale: {
        ...enUS,
        formatRelative: (token) =>
          formatRelativeLocale[token as keyof typeof formatRelativeLocale],
      },
    });

    return formatedDate;
  };

  return { dateFormate };
};
