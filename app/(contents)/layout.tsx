type Props = {
  children: React.ReactNode;
};

const ContentLayout = ({ children }: Props) => {
  return (
    <div className="h-full w-full flex flex-col text-white">
      {children}
    </div>
  );
};

export default ContentLayout;
