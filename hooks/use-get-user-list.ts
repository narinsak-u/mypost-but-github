"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export const useGetUserList = () => {
  const { data, isFetching, isError, error } = useQuery<User[], Error>({
    queryKey: queryKeys.users.list(),
    queryFn: async () => {
      const { data } = await axios.get<{ data: User[] }>(`/api/user`);
      return data.data || [];
    },
  });

  const usernames = data?.map((user) => user.name ?? "User") ?? [];

  return { data, isFetching, isError, error, usernames };
};
