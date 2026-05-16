# Design Spec: Collapsible Chat Dialog

## 1. Goal
Implement a collapsible chat dialog that resides at the bottom-right of the screen and persists across page navigations without reloading.

## 2. Architecture & Components

### State Management (`store/use-chat-store.ts`)
Update the `ChatStore` to include:
- `isCollapsed: boolean`: Tracks if the chat window is minimized to a tab.
- `toggleCollapse()`: Toggles the `isCollapsed` state.
- `setCollapsed(val: boolean)`: Explicitly sets the collapse state.
- `open(conversationId)`: Should also set `isCollapsed: false` to ensure the window is expanded when opened.

### Chat Container (`components/chat/ChatDialog.tsx`)
Refactor the component to:
- **Remove `Dialog` (Shadcn UI):** Replace with a `fixed` position `div` at `bottom: 0; right: 20px;`.
- **Z-Index:** Set to a high value (e.g., `z-[50]`) to stay above other content.
- **Conditional Layout:**
  - **Expanded:** Show full chat interface (Sidebar + Message Thread) with a specific height (e.g., `h-[500px]`) and width (e.g., `w-[400px]` or `w-full max-w-2xl`).
  - **Collapsed:** Show a small tab with the current conversation name/avatar (Option B).
- **Header:**
  - Add a "Minimize/Collapse" icon (e.g., `ChevronDown` or `Minus`) next to the "Close" icon.
  - Clicking the header (in collapsed state) or the collapse icon (in expanded state) toggles the state.

### Portal / Mounting (`providers/ModalProvider.tsx`)
- The `ChatDialog` remains in `ModalProvider` so it is mounted once at the root level.
- Since it's no longer a "Modal" (it doesn't have a backdrop), it won't block interactions with the rest of the site.

## 3. Interaction Flow
1. **Initial State:** Chat is closed.
2. **Open:** User clicks a "Message" button or selects a user. Chat window appears at bottom-right in **Expanded** state.
3. **Collapse:** User clicks the collapse icon in the header. Window shrinks to a small tab at the bottom-right.
4. **Expand:** User clicks the collapsed tab. Window expands back to full height.
5. **Navigate:** User changes pages. The chat window (whether expanded or collapsed) remains in its current state because it's mounted in the root layout.
6. **Close:** User clicks the "X" icon. The chat window is unmounted/hidden.

## 4. Visual Design
- **Dark Theme:** Adhere to the existing `#1F1F1F` background and `#30363D` border colors.
- **Transitions:** Use Framer Motion or Tailwind `transition-all` for smooth height and width changes.

## 5. Implementation Tasks (Preliminary)
- Update `use-chat-store.ts`.
- Refactor `ChatDialog.tsx` layout and positioning.
- Add header icons and toggle logic.
- Verify persistence across page changes.
