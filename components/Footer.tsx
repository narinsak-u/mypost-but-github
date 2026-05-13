'use client';

const Footer = ({ getCurrentYear }: { getCurrentYear: number }) => {
  return (
    <footer className="mt-16 border-t border-[#30363D] pt-6 pb-8 px-5 md:px-0">
      <div className="flex flex-col gap-2 sm:gap-4 text-sm text-[#8B949E] sm:flex-row sm:items-center sm:justify-between">
        <div className="shrink-0">{`© ${getCurrentYear} Mypost but Github, Inc.`}</div>
        <div className="flex flex-wrap items-center sm:gap-2">
          Built with 💚{' '}
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9D1D9] hover:underline underline-offset-4">
            Next.js
          </a>
          +
          <a href="https://mongodb.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9D1D9] hover:underline underline-offset-4">
            MongoDB
          </a>
          +
          <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9D1D9] hover:underline underline-offset-4">
            Clerk
          </a>.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
