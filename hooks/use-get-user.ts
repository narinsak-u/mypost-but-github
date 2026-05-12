"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";

type Props = {
  userId: string;
};

export const useGetUser = ({ userId }: Props) => {
  const { data, isFetching } = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/user/${userId}`);
      return data;
    },
  });

  return { data, isFetching };
};
