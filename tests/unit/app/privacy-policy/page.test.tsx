import { render, screen } from '../../../utils/test-utils'
import PrivacyPolicy from '@/app/privacy-policy/page'

describe('Privacy Policy Page', () => {
    it('renders the main heading', () => {
        render(<PrivacyPolicy />)
        // Adjust regex based on actual content if needed
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
})
