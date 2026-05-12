"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { PostPopulated } from "@/types";
import { useQuery } from "@tanstack/react-query";
import useSavedTab from "../store/use-saved-tab";

const fetchPost = async () => {
  const res = await axios.get(`/api/posts`);
  return res.data as PostPopulated[];
};

const useGetSavedCount = () => {
  const { isSelected } = useSavedTab();

  const { data: posts } = useQuery({
    queryKey: ["saved-count"],
    queryFn: fetchPost,
  });

  const [savedCount, setSavedCount] = useState<{
    [userId: number]: number;
  }>({});

  const countPosts = () => {
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
  };

  // Count the number of posts for each user
  //   useEffect(() => {
  //     fetchPost().then((data) => {
  //       if (data) {
  //         setPosts(data);
  //       }
  //     });
  //     countPosts();
  //   }, []);

  //   useEffect(() => {
  //     fetchPost().then((data) => {
  //       if (data) {
  //         setPosts(data);
  //       }
  //     });
  //   }, []);

  useEffect(() => {
    countPosts();
  }, [posts]);

  // return useMemo(() => ({ userPostCount }), [posts]);
  return { savedCount };
};

export default useGetSavedCount;
