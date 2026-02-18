import { render, screen } from '../../../utils/test-utils'
import CareersPage from '@/app/careers/page'

describe('Careers Page', () => {
    it('renders the main heading', () => {
        render(<CareersPage />)
        expect(screen.getByRole('heading', { name: /Join Our Team/i })).toBeInTheDocument()
    })

    it('renders job listings', () => {
        render(<CareersPage />)

        // Check for specific job titles
        expect(screen.getByText(/Senior Automation Engineer/i)).toBeInTheDocument()
        expect(screen.getByText(/Full-Stack Developer/i)).toBeInTheDocument()

        // Verify multiple "View Details" links
        const links = screen.getAllByText(/View Details/i)
        expect(links.length).toBeGreaterThan(0)
    })

    it('renders benefits section', () => {
        render(<CareersPage />)
        expect(screen.getByText(/What We Offer/i)).toBeInTheDocument()
        expect(screen.getByText(/Market-competitive, US-adjusted rates/i)).toBeInTheDocument()
    })
})
