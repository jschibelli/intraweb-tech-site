import { render, screen } from '../../utils/test-utils'
import AboutProfileCard from '@/components/AboutProfileCard'

describe('AboutProfileCard', () => {
    it('renders the profile card', () => {
        render(<AboutProfileCard />)

        // Check that the card renders
        const card = screen.getByRole('heading', { name: /john schibelli/i })
        expect(card).toBeInTheDocument()
    })

    it('displays the founder name', () => {
        render(<AboutProfileCard />)

        expect(screen.getByText('John Schibelli')).toBeInTheDocument()
    })

    it('displays the founder title', () => {
        render(<AboutProfileCard />)

        expect(screen.getByText(/founder.*principal/i)).toBeInTheDocument()
    })

    it('displays the bio text', () => {
        render(<AboutProfileCard />)

        const bioText = screen.getByText(/John founded IntraWeb Technologies/i)
        expect(bioText).toBeInTheDocument()
    })

    it('renders the profile image with correct alt text', () => {
        render(<AboutProfileCard />)

        const image = screen.getByAltText(/John Schibelli - Founder & Principal/i)
        expect(image).toBeInTheDocument()
    })

    it('renders LinkedIn link with correct href', () => {
        render(<AboutProfileCard />)

        const linkedinLink = screen.getByRole('link', { name: /connect on linkedin/i })
        expect(linkedinLink).toBeInTheDocument()
        expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/johnschibelli')
        expect(linkedinLink).toHaveAttribute('target', '_blank')
        expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('has correct semantic structure', () => {
        render(<AboutProfileCard />)

        // H3 heading for name
        const heading = screen.getByRole('heading', { level: 3 })
        expect(heading).toHaveTextContent('John Schibelli')
    })
})
