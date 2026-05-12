'use client';

type Props = {
  children: React.ReactNode;
};

const MainContentWrapper = ({ children }: Props) => {
  return (
    <div className="h-full w-full px-5 md:px-0">
      <div className="rounded-sm">{children}</div>
    </div>
  );
};

export default MainContentWrapper;
