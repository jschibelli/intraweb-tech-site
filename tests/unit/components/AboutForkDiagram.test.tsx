import { render, screen } from '../../utils/test-utils'
import AboutForkDiagram from '@/components/AboutForkDiagram'

describe('AboutForkDiagram', () => {
    it('renders the diagram main sections', () => {
        render(<AboutForkDiagram />)

        expect(screen.getByText('Client Problem Space')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /AI Transformation/i })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /AI Engineering/i })).toBeInTheDocument()
    })

    it('renders list items for AI Transformation', () => {
        render(<AboutForkDiagram />)

        expect(screen.getByText('Decision-making frameworks')).toBeInTheDocument()
        expect(screen.getByText('Organizational readiness')).toBeInTheDocument()
        expect(screen.getByText('Governance structure')).toBeInTheDocument()
    })

    it('renders list items for AI Engineering', () => {
        render(<AboutForkDiagram />)

        expect(screen.getByText('System architecture')).toBeInTheDocument()
        expect(screen.getByText('Production implementation')).toBeInTheDocument()
        expect(screen.getByText('Performance optimization')).toBeInTheDocument()
    })

    it('renders structural conclusion note', () => {
        render(<AboutForkDiagram />)

        expect(screen.getByText(/Structurally different problems/i)).toBeInTheDocument()
    })
})
