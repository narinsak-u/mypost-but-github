# Direct Message Design

## Overview

Implement real-time direct messaging between users with a chat dialog that opens from the profile page. Uses polling with TanStack Query for simplicity.

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
model Conversation {
  id          String    @id @default(cuid()) @map("_id")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  participants User[]   @relation("ConversationParticipants")
  messages     Message[]
  lastMessageAt DateTime @default(now())
}

model Message {
  id        String   @id @default(cuid()) @map("_id")
  content   String
  createdAt DateTime @default(now())
  readAt    DateTime?

  conversationId String @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User   @relation(fields: [senderId], references: [id], onDelete: Cascade)
}
```

Update User model to add relations:

```prisma
conversations     Conversation[] @relation("ConversationParticipants")
sentMessages      Message[]
```

## Server Actions

### createConversation.ts

- Input: `targetUserId: string`
- Logic: Find existing conversation between current user and target, or create new one
- Return: `{ conversation: Conversation } | { error: string }`

### sendMessage.ts

- Input: `conversationId: string, content: string`
- Logic: Create message, update `lastMessageAt` on conversation
- Return: `{ message: Message } | { error: string }`
- Revalidate: relevant paths

### getConversations.ts

- Input: none
- Logic: Get all conversations where user is participant, include last message preview and other participant
- Return: `{ conversations: ConversationWithParticipants[] } | { error: string }`

### getMessages.ts

- Input: `conversationId: string`
- Logic: Get all messages in conversation, sorted by createdAt
- Return: `{ messages: Message[] } | { error: string }`

### markAsRead.ts

- Input: `conversationId: string`
- Logic: Update `readAt` on all messages in conversation where sender != current user
- Return: `{ success: boolean } | { error: string }`

## UI Components

### Zustand Store: store/use-chat-store.ts

```typescript
interface ChatState {
  isOpen: boolean;
  currentConversationId: string | null;
  open: (conversationId: string) => void;
  close: () => void;
}
```

### ChatDialog.tsx

- Uses existing Dialog/Drawer component
- Two sections: conversation list (sidebar) and message thread
- Polls conversations every 5 seconds via TanStack Query
- Polls messages every 3 seconds when conversation is active

### MessageBubble.tsx

- Props: `message: Message, isOwn: boolean`
- Left-align for other user, right-align for self
- Show timestamp on hover

### MessageInput.tsx

- Textarea with auto-resize
- Send button
- Submit on Enter (Shift+Enter for newline)

## Profile Banner Change

In `components/ProfileBanner.tsx`:

- Replace mailto link with button that calls `openChat(user.id)`
- Import and use `useChatStore`

## TanStack Query Integration

```typescript
// use-get-conversations.ts
export const useGetConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    refetchInterval: 5000, // 5 seconds
  });
};

// use-get-messages.ts
export const useGetMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    refetchInterval: 3000, // 3 seconds
    enabled: !!conversationId,
  });
};
```

## Error Handling

- All server actions return `{ error: string }` on failure
- Show toast.error with message on UI failure
- Handle missing user gracefully (shouldn't happen since only logged-in users can message)

## File Structure

```
actions/
├── create-conversation.ts
├── send-message.ts
├── get-conversations.ts
├── get-messages.ts
└── mark-as-read.ts

hooks/
├── use-get-conversations.ts
├── use-get-messages.ts
└── use-send-message.ts

store/
└── use-chat-store.ts

components/
├── chat/
│   ├── ChatDialog.tsx
│   ├── ConversationList.tsx
│   ├── MessageBubble.tsx
│   └── MessageInput.tsx
```

## Testing Considerations

- Test message send and receive
- Test that polling updates UI
- Test that conversation is created if it doesn't exist
- Test that read status updates properly
