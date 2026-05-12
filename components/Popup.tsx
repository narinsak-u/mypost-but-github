"use client";

import { ReactionButtonType } from "./posts/PostItem";

// import { FacebookShareButton, TwitterShareButton } from "react-share";
// import { siteMetadata } from "@/site/siteMetadata";

type Props = {
  selected: ReactionButtonType;
  setSelected: React.Dispatch<React.SetStateAction<ReactionButtonType>>;
};

const Popup = ({ selected, setSelected }: Props) => {
  return (
    <div>Popup</div>
    // <MyPopover
    //   relative={"true"}
    //   // open={selected.share}
    //   caret="bottom"
    //   sx={{
    //     position: "absolute",
    //     left: "38%",
    //     bottom: "15%",
    //   }}
    // >
    //   <Popover.Content
    //     sx={{ mt: 2, bg: "#444C56", width: "200px", border: "none" }}
    //   >
    //     <div className="flex items-baseline justify-between">
    //       <Heading sx={{ fontSize: 2, marginBottom: "10px" }}>
    //         Share with:
    //       </Heading>
    //       <span
    //         style={{
    //           cursor: "pointer",
    //         }}
    //         // onClick={() => setSelected({ ...selected, share: !selected.share })}
    //       >
    //         <XCircleFillIcon size={24} />
    //       </span>
    //     </div>
    //     <div className="flex flex-col items-start">
    //       <FacebookShareButton
    //         // url="http://github.com"
    //         url={`${siteMetadata.siteAddress}`}
    //         title="Let's talk about this"
    //         hashtag="#mypostbutgithub"
    //       >
    //         <div className="h-[34px]">
    //           <div className="flex items-center justify-start">
    //             <BsFacebook size={18} color="#2E89F1" />
    //             <Text
    //               sx={{ marginInlineStart: "10px", alignContent: "center" }}
    //             >
    //               Facebook
    //             </Text>
    //           </div>
    //         </div>
    //       </FacebookShareButton>
    //       <TwitterShareButton
    //         // url="http://github.com"
    //         url={`${siteMetadata.siteAddress}`}
    //         hashtags={["mypostbutgithub"]}
    //         title="Let's talk about this"
    //       >
    //         <div className="h-[34px] bg-[#444C56] gap-5">
    //           <div className="flex justify-start items-center">
    //             <BsTwitter size={18} color="#2E89F1" />
    //             <Text sx={{ marginInlineStart: "10px" }}>Twitter</Text>
    //           </div>
    //         </div>
    //       </TwitterShareButton>
    //     </div>
    //   </Popover.Content>
    // </MyPopover>
  );
};

export default Popup;
