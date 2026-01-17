import { render, screen } from '../../utils/test-utils'
import { Footer } from '@/components/Footer'

describe('Footer', () => {
    it('renders the footer component', () => {
        render(<Footer />)

        // Check that footer element exists
        const footer = screen.getByRole('contentinfo')
        expect(footer).toBeInTheDocument()
    })

    it('displays the correct copyright year', () => {
        render(<Footer />)

        const currentYear = new Date().getFullYear()
        const copyrightText = screen.getAllByText(new RegExp(`© ${currentYear} IntraWeb Technologies`))

        // Should appear in both mobile and desktop versions
        expect(copyrightText.length).toBeGreaterThan(0)
    })

    it('renders social media links with correct href attributes', () => {
        render(<Footer />)

        // Get all LinkedIn links (mobile + desktop)
        const linkedinLinks = screen.getAllByLabelText('LinkedIn')
        expect(linkedinLinks.length).toBeGreaterThan(0)
        linkedinLinks.forEach(link => {
            expect(link).toHaveAttribute('href', 'https://linkedin.com')
        })

        // Get all Facebook links (mobile + desktop)
        const facebookLinks = screen.getAllByLabelText('Facebook')
        expect(facebookLinks.length).toBeGreaterThan(0)
        facebookLinks.forEach(link => {
            expect(link).toHaveAttribute('href', 'https://facebook.com')
        })
    })

    it('renders legal policy links', () => {
        render(<Footer />)

        // Privacy Policy links (mobile + desktop)
        const privacyLinks = screen.getAllByText('Privacy Policy')
        expect(privacyLinks.length).toBeGreaterThan(0)
        privacyLinks.forEach(link => {
            expect(link).toHaveAttribute('href', '/privacy-policy')
        })

        // Terms of Service links
        const termsLinks = screen.getAllByText('Terms of Service')
        expect(termsLinks.length).toBeGreaterThan(0)
        termsLinks.forEach(link => {
            expect(link).toHaveAttribute('href', '/terms-of-service')
        })

        // Accessibility links
        const accessibilityLinks = screen.getAllByText('Accessibility')
        expect(accessibilityLinks.length).toBeGreaterThan(0)
        accessibilityLinks.forEach(link => {
            expect(link).toHaveAttribute('href', '/accessibility')
        })
    })

    it('displays contact email for data subject requests', () => {
        render(<Footer />)

        const emailLinks = screen.getAllByText('contact@intrawebtech.com')
        expect(emailLinks.length).toBeGreaterThan(0)
        emailLinks.forEach(link => {
            expect(link).toHaveAttribute('href', 'mailto:contact@intrawebtech.com')
        })
    })

    it('renders the company logo', () => {
        render(<Footer />)

        const logos = screen.getAllByAltText('IntraWeb Technologies Logo')
        // Should have both mobile and desktop versions
        expect(logos.length).toBe(2)
    })

    it('renders quick links navigation on desktop', () => {
        render(<Footer />)

        // These links only appear in desktop version
        expect(screen.getByText('AI Transformation')).toBeInTheDocument()
        expect(screen.getByText('AI Engineering')).toBeInTheDocument()
        expect(screen.getByText('About')).toBeInTheDocument()
        expect(screen.getByText('Contact')).toBeInTheDocument()
        expect(screen.getByText('Careers')).toBeInTheDocument()
    })

    it('has correct heading structure', () => {
        render(<Footer />)

        const headings = screen.getAllByRole('heading', { level: 3 })
        const headingTexts = headings.map(h => h.textContent)

        // Should have "Stay Connected" and "Quick Links" headings
        expect(headingTexts).toContain('Stay Connected')
        expect(headingTexts).toContain('Quick Links')
    })
})
