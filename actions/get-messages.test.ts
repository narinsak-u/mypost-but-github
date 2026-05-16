import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessages } from './get-messages';
import { db as prisma } from '@/lib/prismadb';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prismadb', () => ({
  db: {
    message: {
      findMany: vi.fn(),
    },
    conversation: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

describe('getMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return unauthorized if no user session', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await getMessages('conv-1');
    expect(result).toEqual({ error: 'Unauthorized' });
  });

  it('should return messages for a conversation', async () => {
    (auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1' },
    });
    
    (prisma.conversation.findFirst as any).mockResolvedValue({ id: 'conv-1' });

    const mockMessages = [
      { id: 'msg-1', content: 'hello', sender: { name: 'User 1' } },
      { id: 'msg-2', content: 'hi', sender: { name: 'User 2' } },
    ];
    (prisma.message.findMany as any).mockResolvedValue(mockMessages);

    const result = await getMessages('conv-1');

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'conv-1',
        participantIds: {
          has: 'user-1',
        },
      },
    });

    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: {
        conversationId: 'conv-1',
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    expect(result).toEqual(mockMessages);
  });

  it('should return unauthorized if user is not a participant', async () => {
    (auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1' },
    });
    
    (prisma.conversation.findFirst as any).mockResolvedValue(null);

    const result = await getMessages('conv-1');
    expect(result).toEqual({ error: 'Unauthorized or conversation not found' });
  });

  it('should return error if conversationId is missing', async () => {
    (auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1' },
    });

    const result = await getMessages('');
    expect(result).toEqual({ error: 'Conversation ID is required' });
  });
});
