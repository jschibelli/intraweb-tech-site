import { render, screen } from '../../../utils/test-utils'
import AboutPage from '@/app/about/page'

// Mock the Client Component to verify page delegates rendering
jest.mock('@/app/about/AboutClient', () => {
    return function MockAboutClient() {
        return <div data-testid="about-client-mock">About Client Content</div>
    }
})

describe('About Page', () => {
    it('renders the AboutClient component', () => {
        render(<AboutPage />)
        expect(screen.getByTestId('about-client-mock')).toBeInTheDocument()
    })
})
