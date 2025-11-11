import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiClient } from '@/integrations/ApiClient'

// Mock ApiClient
vi.mock('@/integrations/ApiClient', () => ({
  ApiClient: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}))

describe('Example Service Test', () => {
  let mockApiClient: any

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
    vi.mocked(ApiClient.create).mockReturnValue(mockApiClient)
  })

  it('should mock ApiClient correctly', () => {
    const client = ApiClient.create()
    expect(client).toBeDefined()
    expect(client.get).toBeDefined()
    expect(client.post).toBeDefined()
  })

  it('should handle mocked API calls', async () => {
    const mockData = { id: '1', name: 'Test' }
    mockApiClient.get.mockResolvedValue({ data: mockData })

    const client = ApiClient.create()
    const result = await client.get('/test')

    expect(result.data).toEqual(mockData)
    expect(mockApiClient.get).toHaveBeenCalledWith('/test')
  })
})

