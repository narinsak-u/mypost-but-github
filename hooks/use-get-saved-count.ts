"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { PostPopulated } from "@/types";
import { useQuery } from "@tanstack/react-query";
import useSavedTab from "../store/use-saved-tab";
import { queryKeys } from "./keys";

const fetchPost = async () => {
  const res = await axios.get(`/api/posts`);
  return res.data as PostPopulated[];
};

const useGetSavedCount = () => {
  const { tab } = useSavedTab();

  const { data: posts } = useQuery({
    queryKey: queryKeys.counts.saved,
    queryFn: fetchPost,
  });

  const [savedCount, setSavedCount] = useState<{
    [userId: number]: number;
  }>({});

  useEffect(() => {
    if (!posts?.length) return;

    const counts: { [userId: number]: number } = {};

    posts.forEach((post) => {
      post.saveIds.forEach((saveId) => {
        if (!counts[saveId]) {
          counts[saveId] = 1;
        } else {
          counts[saveId]++;
        }
      });
    });

    setSavedCount(counts);
  }, [posts]);

  return { savedCount };
};

export default useGetSavedCount;
