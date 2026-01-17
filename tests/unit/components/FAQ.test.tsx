import { render, screen, waitFor, fireEvent } from '../../utils/test-utils'
import FAQ from '@/components/FAQ'

// Mock fetch
global.fetch = jest.fn()

describe('FAQ Component', () => {
    const mockFaqs = [
        { question: 'What is AI?', answer: 'AI is artificial intelligence.' },
        { question: 'How much does it cost?', answer: 'It depends.' }
    ]

    beforeEach(() => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockFaqs,
        })
    })

    it('renders and fetches FAQs', async () => {
        render(<FAQ />)

        await waitFor(() => {
            expect(screen.getByText('What is AI?')).toBeInTheDocument()
            expect(screen.getByText('How much does it cost?')).toBeInTheDocument()
        })
    })

    it('toggles answers on click', async () => {
        render(<FAQ />)

        await waitFor(() => {
            expect(screen.getByText('What is AI?')).toBeInTheDocument()
        })

        // Answer hidden initially (css class check or visibility)
        // The component toggle sets 'max-h' classes.
        // We can check if answer text is in document (it is always in DOM, just visually hidden).
        // But testing-library `toBeVisible` checks visibility.
        // The component uses `max-h-0` and `overflow-hidden`.
        // `toBeVisible` might not detect height 0 properly in JSDOM unless compiled styles are present, but usually it tries.

        // Let's just check aria attributes.
        const button = screen.getByText('What is AI?').closest('button')
        expect(button).toHaveAttribute('aria-expanded', 'false')

        fireEvent.click(button!)
        expect(button).toHaveAttribute('aria-expanded', 'true')

        // Click again to close
        fireEvent.click(button!)
        expect(button).toHaveAttribute('aria-expanded', 'false')
    })
})
