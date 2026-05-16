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

type Props = {
  userId: string;
};

export const useGetUser = ({ userId }: Props) => {
  const { data, isFetching, isError, error } = useQuery<User, Error>({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const { data } = await axios.get<User>(`/api/user/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  return { data, isFetching, isError, error };
};
