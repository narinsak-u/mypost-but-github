"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const useGetUserList = () => {
  const { data, isFetching } = useQuery({
    queryKey: ["fetch-user-list"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/user`);
      return data.data || [];
    },
  });

  const usernames =
    (data && data.map((user: any) => user.name ?? "User")) ?? [];

  return { data, isFetching, usernames };
};
