"use client";

import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Props = {
  userId: string;
};

export const useGetUser = ({ userId }: Props) => {
  //   const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["fetct-user", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/user/${userId}`);
      return data
    },
  });

  return { data, isFetching };
};
