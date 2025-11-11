import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from './utils'
import { useQuery } from '@tanstack/react-query'

// Test component that uses React Query
const TestQueryComponent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return { message: 'Test data' }
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error occurred</div>
  return <div>{data?.message}</div>
}

describe('React Query Integration', () => {
  it('should render component with React Query provider', () => {
    renderWithProviders(<TestQueryComponent />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle query data correctly', async () => {
    renderWithProviders(<TestQueryComponent />)
    
    await waitFor(() => {
      expect(screen.getByText('Test data')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('should not retry queries in tests', async () => {
    const queryFn = vi.fn().mockRejectedValueOnce(new Error('Test error'))
    
    const TestErrorComponent = () => {
      const { error } = useQuery({
        queryKey: ['error-test'],
        queryFn,
        retry: false,
      })
      
      if (error) return <div>Error occurred</div>
      return <div>Success</div>
    }

    renderWithProviders(<TestErrorComponent />)
    
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
    
    // Verify query was only called once (no retries)
    expect(queryFn).toHaveBeenCalledTimes(1)
  })
})

