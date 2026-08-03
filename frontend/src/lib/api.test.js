import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockClient;
let requestInterceptor;
let responseRejectedInterceptor;

const axiosCreate = vi.fn(() => mockClient);

vi.mock('axios', () => ({
  default: { create: axiosCreate },
  create: axiosCreate,
}));

function createMockClient() {
  requestInterceptor = undefined;
  responseRejectedInterceptor = undefined;

  mockClient = {
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: {
        use: vi.fn((handler) => {
          requestInterceptor = handler;
        }),
      },
      response: {
        use: vi.fn((_fulfilled, rejected) => {
          responseRejectedInterceptor = rejected;
        }),
      },
    },
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  };
}

async function loadApiModule() {
  return import('./api');
}

beforeEach(() => {
  vi.resetModules();
  createMockClient();
  vi.stubGlobal('document', { cookie: '' });
});

describe('api client interceptors', () => {
  it('bootstraps a CSRF token for mutating requests when no cookie is present', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { csrfToken: 'csrf-token-123' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { apiClient } = await loadApiModule();
    expect(apiClient).toBe(mockClient);

    const config = { method: 'post', url: '/progress/reset', headers: {} };
    const nextConfig = await requestInterceptor(config);

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/csrf$/), expect.objectContaining({
      credentials: 'include',
    }));
    expect(nextConfig.headers['X-CSRF-Token']).toBe('csrf-token-123');
    expect(apiClient.defaults.headers.common['X-CSRF-Token']).toBe('csrf-token-123');
  });

  it('uses an existing CSRF cookie without fetching bootstrap', async () => {
    vi.stubGlobal('document', { cookie: 'csrfToken=existing-token' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await loadApiModule();

    const config = { method: 'post', url: '/comments', headers: {} };
    const nextConfig = await requestInterceptor(config);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(nextConfig.headers['X-CSRF-Token']).toBe('existing-token');
  });

  it('dispatches auth-expired when refresh fails', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    mockClient.post.mockRejectedValueOnce(new Error('refresh failed'));

    await loadApiModule();

    await expect(
      responseRejectedInterceptor({
        config: { url: '/progress', _retry: false },
        response: { status: 401 },
      })
    ).rejects.toThrow('refresh failed');

    expect(mockClient.post).toHaveBeenCalledWith('/auth/refresh');
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
  });
});