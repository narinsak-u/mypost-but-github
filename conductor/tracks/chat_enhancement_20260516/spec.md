# Specification: Enhance Chat UI/UX and stability

## Overview
Improve the existing chat functionality to ensure it is reliable, responsive, and provides a polished user experience consistent with the project's GitHub-inspired design.

## Functional Requirements
- Robust message state management.
- Smooth automatic scrolling to the latest messages.
- Clear loading and empty states.
- Improved mobile navigation within the chat dialog.

## Technical Constraints
- Must use existing Zustand store (`use-chat-store.ts`).
- Must adhere to Next.js 16 Server Actions for data mutations.
- Tailwind CSS 4 for all styling.
