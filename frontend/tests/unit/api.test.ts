import { vi, describe, it, expect, beforeEach } from 'vitest';
import { apiFetch } from '../../src/config/api';

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('apiFetch', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });
  });

  it('should include credentials: include in fetch options', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    await apiFetch('/api/test');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('should pass through custom options', async () => {
    await apiFetch('/api/test', { method: 'POST' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
  });
});
