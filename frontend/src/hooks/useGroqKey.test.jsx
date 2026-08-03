import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasGroqKey } from '@/lib/groq';
import { useGroqKey } from './useGroqKey';

vi.mock('@/lib/groq', () => ({
  hasGroqKey: vi.fn(),
}));

const hasGroqKeyMock = vi.mocked(hasGroqKey);

beforeEach(() => {
  hasGroqKeyMock.mockReset();
});

describe('useGroqKey', () => {
  it('updates when the app emits a settings refresh event', async () => {
    let available = false;
    hasGroqKeyMock.mockImplementation(() => available);

    const { result } = renderHook(() => useGroqKey());

    expect(result.current).toBe(false);

    available = true;

    act(() => {
      window.dispatchEvent(new CustomEvent('sql-practice-settings-updated'));
    });

    await waitFor(() => expect(result.current).toBe(true));
  });
});