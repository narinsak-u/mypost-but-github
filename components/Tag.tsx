"use client";

import { Badge } from "@/components/ui/badge";

type Props = {
  text: string;
};

const Tag = ({ text }: Props) => {
  return <Badge variant="secondary">{text}</Badge>;
};

export default Tag;
