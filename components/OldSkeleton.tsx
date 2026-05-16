"use client";

type Props = {};

const OldSkeleton = (props: Props) => {
  return (
    <div className="mt-10 dark">
      <h3
        className="h-4 bg-zinc-200 rounded-md dark:bg-zinc-700 w-[40%]"
        aria-hidden="true"
        aria-label="Loading"
      ></h3>

      <ul className="mt-5 space-y-3">
        <li className="w-full h-4 bg-zinc-200 rounded-md dark:bg-zinc-700"></li>
        <li className="w-full h-4 bg-zinc-200 rounded-md dark:bg-zinc-700"></li>
        <li className="w-full h-4 bg-zinc-200 rounded-md dark:bg-zinc-700"></li>
        <li className="w-full h-4 bg-zinc-200 rounded-md dark:bg-zinc-700"></li>
      </ul>
    </div>
  );
};

export default OldSkeleton;
