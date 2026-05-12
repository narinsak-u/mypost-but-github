"use client";

import { useEffect } from "react";
import { BlockNoteSchema, defaultInlineContentSpecs } from "@blocknote/core";

// @ts-ignore
import { filterSuggestionItems } from "@blocknote/core/extensions";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { Mention } from "./Mention";

type Props = {
  onChange?: (editor: any) => void;
  initialContent?: string;
  editable?: boolean;
  users?: string[];
};

const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
  },
});

const getMentionMenuItems = (
  editor: typeof schema.BlockNoteEditor,
  users: string[]
): DefaultReactSuggestionItem[] => {
  return users.map((user) => ({
    title: user,
    onItemClick: () => {
      editor.insertInlineContent([
        {
          type: "mention",
          props: {
            user,
          },
        },
        " ",
      ]);
    },
  }));
};

const Editor = ({
  onChange = () => { },
  editable,
  initialContent,
  users = [],
}: Props) => {
  const editor = useCreateBlockNote({ schema });

  useEffect(() => {
    async function loadInitialHTML() {
      if (!initialContent) return null;

      const blocks = await editor.tryParseHTMLToBlocks(initialContent);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialHTML();
  }, [editor, initialContent]);

  return (
    <div>
      <BlockNoteView
        editor={editor}
        editable={editable}
        tableHandles
        onChange={() => onChange(editor)}
      >
        <SuggestionMenuController
          triggerCharacter={"@"}
          getItems={async (query) =>
            filterSuggestionItems(getMentionMenuItems(editor, users), query)
          }
        />
      </BlockNoteView>
    </div>
  );
};

export default Editor;
