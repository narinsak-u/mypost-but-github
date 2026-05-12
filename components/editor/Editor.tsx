"use client";

// import { useEffect } from "react";
// import {
//   BlockNoteSchema,
//   defaultInlineContentSpecs,
//   filterSuggestionItems,
// } from "@blocknote/core";
// import {
//   BlockNoteView,
//   useCreateBlockNote,
//   DefaultReactSuggestionItem,
//   SuggestionMenuController,
// } from "@blocknote/react";
// import "@blocknote/core/fonts/inter.css";
// import "@blocknote/react/style.css";

// import { Mention } from "./Mention";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";


// Our <Editor> component we can reuse later
export default function Editor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();
  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} />;
}

// type Props = {
//   onChange: (editor: any) => void;
//   initialContent?: string;
//   editable?: boolean;
//   users: string[];
// };

// const Editor = ({ onChange, editable, initialContent, users }: Props) => {
//   // Our schema with inline content specs, which contain the configs and
//   // implementations for inline content  that we want our editor to use.
//   const schema = BlockNoteSchema.create({
//     inlineContentSpecs: {
//       // Adds all default inline content.
//       ...defaultInlineContentSpecs,
//       // Adds the mention tag.
//       mention: Mention,
//     },
//   });

//   // Function which gets all users for the mentions menu.
//   const getMentionMenuItems = (
//     editor: typeof schema.BlockNoteEditor
//   ): DefaultReactSuggestionItem[] => {
//     // const users = ["Steve", "Bob", "Joe", "Mike"];

//     return users.map((user) => ({
//       title: user,
//       onItemClick: () => {
//         editor.insertInlineContent([
//           {
//             type: "mention",
//             props: {
//               user,
//             },
//           },
//           " ", // add a space after the mention
//         ]);
//       },
//     }));
//   };

//   const editor = useCreateBlockNote({ schema });

//   /**
//    * For initialization; on mount, convert the initial Markdown to blocks
//    * and replace the default editor's content
//    */
//   useEffect(() => {
//     async function loadInitialHTML() {
//       if (!initialContent) return null;

//       const blocks = await editor.tryParseHTMLToBlocks(initialContent);
//       editor.replaceBlocks(editor.document, blocks);
//     }
//     loadInitialHTML();
//   }, [editor]);

//   return (
//     <div>
//       <BlockNoteView
//         editor={editor}
//         editable={editable}
//         tableHandles
//         onChange={() => onChange(editor)}
//       >
//         {/* Adds a mentions menu which opens with the "@" key */}
//         <SuggestionMenuController
//           triggerCharacter={"@"}
//           getItems={async (query) =>
//             // Gets the mentions menu items
//             filterSuggestionItems(getMentionMenuItems(editor), query)
//           }
//         />
//       </BlockNoteView>
//     </div>
//   );
// };

// export default Editor;
