"use client";

export function renderHighlight(highlight: any) {
  return highlight.texts.map((part: any, index: number) => {
    const key = `${part.type}-${part.value}-${index}`;
    if (part.type === "hit") {
      return (
        <mark
          key={key}
          className="bg-[#1F6FEB]/20 text-[#C9D1D9] rounded-sm p-0.5 font-semibold"
        >
          {part.value}
        </mark>
      );
    }

    return <span key={key}>{part.value}</span>;
  });
}
