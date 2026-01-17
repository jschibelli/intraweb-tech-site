import { render, screen } from '../../utils/test-utils'
import Home from '@/app/page'

describe('Home Page', () => {
    it('renders the main heading', () => {
        render(<Home />)
        expect(screen.getByText(/AI exists/i)).toBeInTheDocument()
        expect(screen.getByText(/Most organizations still lack the structure/i)).toBeInTheDocument()
    })

    it('renders the "Not For Us" comparison sections', () => {
        render(<Home />)
        expect(screen.getByText(/We are not a consultancy/i)).toBeInTheDocument()
    })

    it('renders navigation links', () => {
        render(<Home />)
        // Check for specific links
        expect(screen.getByRole('link', { name: /Explore AI Transformation/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Explore AI Engineering/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Begin a conversation/i })).toBeInTheDocument()
    })
})
