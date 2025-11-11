import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './utils'

// Simple test component that uses React Query
const TestComponent = () => {
  return <div>Test Component</div>
}

describe('Test Utilities', () => {
  it('renderWithProviders should render component', () => {
    renderWithProviders(<TestComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('renderWithProviders should provide QueryClient context', () => {
    const { container } = renderWithProviders(<TestComponent />)
    expect(container).toBeInTheDocument()
  })
})

