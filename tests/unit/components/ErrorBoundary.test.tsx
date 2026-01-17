import { render, screen } from '../../utils/test-utils'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Component that throws to test error boundary
const ThrowError = () => {
    throw new Error('Test error')
}

describe('ErrorBoundary', () => {
    // Suppress console.error for these tests as we expect errors
    const originalError = console.error
    beforeAll(() => {
        console.error = jest.fn()
    })

    afterAll(() => {
        console.error = originalError
    })

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Content</div>
            </ErrorBoundary>
        )

        expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders error message when child throws', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
        expect(screen.getByText('Please refresh the page or contact support.')).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
        render(
            <ErrorBoundary fallback={<div>Custom Error</div>}>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(screen.getByText('Custom Error')).toBeInTheDocument()
        expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument()
    })
})
