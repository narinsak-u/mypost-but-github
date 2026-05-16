import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatScroll } from './use-chat-scroll';

describe('useChatScroll', () => {
  let mockElement: any;

  beforeEach(() => {
    mockElement = {
      scrollTo: vi.fn(),
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 500,
    };
  });

  it('should scroll to bottom on initial load', async () => {
    const chatRef = { current: mockElement };
    renderHook(() => useChatScroll({ 
      chatRef, 
      count: 10,
      shouldScroll: true 
    }));

    await vi.waitFor(() => {
      expect(mockElement.scrollTo).toHaveBeenCalled();
    });
  });

  it('should not scroll if shouldScroll is false', () => {
    const chatRef = { current: mockElement };
    renderHook(() => useChatScroll({ 
      chatRef, 
      count: 10,
      shouldScroll: false 
    }));

    expect(mockElement.scrollTo).not.toHaveBeenCalled();
  });
});
