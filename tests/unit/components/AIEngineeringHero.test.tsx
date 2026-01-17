import { render, screen } from '../../utils/test-utils'
import AIEngineeringHero from '@/components/AIEngineeringHero'

describe('AIEngineeringHero', () => {
    it('renders the hero section', () => {
        render(<AIEngineeringHero />)
        expect(screen.getByText(/Systems Architecture for Institutional AI/i)).toBeInTheDocument()
        expect(screen.getByText(/Most transformation firms stop at recommendations/i)).toBeInTheDocument()
        expect(screen.getByText(/Discuss Engineering Requirements/i)).toBeInTheDocument()
    })
})
