'use client';

import { Rocket } from "lucide-react";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex gap-2 items-center text-[#57606A] pt-2 ">
          <Rocket />
          <div className="font-bold text-lg">{`© ${new Date().getFullYear()} Mypost but Github`}</div>
        </div>
        <div className="text-sm text-[#57606A]">
          Made with 💙 by alohadancemeow x FailureMan
        </div>
      </div>
    </div>
  );
};

export default Footer;
