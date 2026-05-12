"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";

export const useGetUserList = () => {
  const { data, isFetching } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const { data } = await axios.get(`/api/user`);
      return data.data || [];
    },
  });

  const usernames =
    (data && data.map((user) => user.name)) ?? [];

  return { data, isFetching, usernames };
};
