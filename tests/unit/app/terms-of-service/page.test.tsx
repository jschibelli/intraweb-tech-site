import { render, screen } from '../../../utils/test-utils'
import TermsOfService from '@/app/terms-of-service/page'

describe('Terms of Service Page', () => {
    it('renders the main heading', () => {
        render(<TermsOfService />)
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
})
