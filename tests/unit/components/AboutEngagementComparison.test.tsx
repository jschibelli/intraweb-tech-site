import { render, screen } from '../../utils/test-utils'
import AboutEngagementComparison from '@/components/AboutEngagementComparison'

describe('AboutEngagementComparison', () => {
    it('renders Good Fit section column', () => {
        render(<AboutEngagementComparison />)

        expect(screen.getByRole('heading', { name: /Good Fit/i })).toBeInTheDocument()

        // Check key points
        expect(screen.getByText(/architectural judgment/i)).toBeInTheDocument()
        expect(screen.getByText(/willingness to redesign/i)).toBeInTheDocument()
        expect(screen.getByText(/executive sponsorship/i)).toBeInTheDocument()
    })

    it('renders Not For Us section column', () => {
        render(<AboutEngagementComparison />)

        expect(screen.getByRole('heading', { name: /Not For Us/i })).toBeInTheDocument()

        // Check key points
        expect(screen.getByText(/Vendor execution of predefined requirements/i)).toBeInTheDocument()
        expect(screen.queryByText(/Expected of AI adoption/i)).not.toBeInTheDocument()
        expect(screen.getByText(/Expectation of AI adoption without operational change/i)).toBeInTheDocument()
    })
})
