import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessage } from './send-message';
import { db as prisma } from '@/lib/prismadb';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/prismadb', () => ({
  db: {
    message: {
      create: vi.fn(),
    },
    conversation: {
      update: vi.fn(),
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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return unauthorized if no user session', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await sendMessage('conv-1', 'hello');
    expect(result).toEqual({ error: 'Unauthorized' });
  });

  it('should create a message and update conversation', async () => {
    (auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1' },
    });
    
    (prisma.conversation.findFirst as any).mockResolvedValue({ id: 'conv-1' });

    const mockMessage = { id: 'msg-1', content: 'hello', conversationId: 'conv-1', senderId: 'user-1' };
    (prisma.message.create as any).mockResolvedValue(mockMessage);

    const result = await sendMessage('conv-1', 'hello');

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'conv-1',
        participantIds: {
          has: 'user-1',
        },
      },
    });

    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        content: 'hello',
        conversationId: 'conv-1',
        senderId: 'user-1',
      },
    });
    expect(prisma.conversation.update).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(result).toEqual(mockMessage);
  });

  it('should return unauthorized if user is not a participant', async () => {
    (auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1' },
    });
    
    (prisma.conversation.findFirst as any).mockResolvedValue(null);

    const result = await sendMessage('conv-1', 'hello');
    expect(result).toEqual({ error: 'Unauthorized or conversation not found' });
  });

  it('should return error for missing fields', async () => {
    (auth.api.getSession as any).mockResolvedValue({
      user: { id: 'user-1' },
    });

    const result = await sendMessage('', '');
    expect(result).toEqual({ error: 'Missing required fields' });
  });
});
