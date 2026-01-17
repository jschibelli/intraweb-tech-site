import { render, screen, waitFor } from '../../utils/test-utils'
import Hero from '@/components/Hero'

// Mock fetch global
global.fetch = jest.fn()

const mockHeroData = {
    heading: 'Test Heading',
    subheading: 'Test Subheading',
    cta: {
        label: 'Test CTA',
        href: '/test-link'
    }
}

describe('Hero', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockReset()
    })

    it('renders hero content after fetching data', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => mockHeroData
        })

        render(<Hero />)

        // Should wait for content to appear
        await waitFor(() => {
            expect(screen.getByText('Test Heading')).toBeInTheDocument()
        })

        expect(screen.getByText('Test Subheading')).toBeInTheDocument()

        const ctaLink = screen.getByRole('link', { name: /test cta/i })
        expect(ctaLink).toBeInTheDocument()
        expect(ctaLink).toHaveAttribute('href', '/test-link')
    })

    it('does not render anything while loading or if data missing', () => {
        // Mock fetch to never resolve or return null to simulate loading/error
        (global.fetch as jest.Mock).mockReturnValue(new Promise(() => { }))

        const { container } = render(<Hero />)

        expect(container).toBeEmptyDOMElement()
    })
})
