import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import Cookies from 'js-cookie'

// Mock js-cookie
jest.mock('js-cookie', () => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
}))

describe('CookieConsentBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset internal state of component is tricky without remounting.
        // render calls remount each test.
    })

    it('does not render if consent cookie exists', () => {
        (Cookies.get as jest.Mock).mockReturnValue('true')

        const { container } = render(<CookieConsentBanner />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders if consent cookie is missing', () => {
        (Cookies.get as jest.Mock).mockReturnValue(undefined)

        render(<CookieConsentBanner />)
        expect(screen.getByText(/We use cookies to improve your experience/i)).toBeInTheDocument()
    })

    it('accepts all cookies', async () => {
        (Cookies.get as jest.Mock).mockReturnValue(undefined)

        render(<CookieConsentBanner />)

        await userEvent.click(screen.getByText('Accept All'))

        await waitFor(() => {
            expect(Cookies.set).toHaveBeenCalledWith('cookie_consent', 'true', expect.any(Object))
            expect(Cookies.set).toHaveBeenCalledWith('cookie_consent_analytics', 'true', expect.any(Object))
            expect(Cookies.set).toHaveBeenCalledWith('cookie_consent_marketing', 'true', expect.any(Object))
        })
    })

    it('opens preferences', async () => {
        (Cookies.get as jest.Mock).mockReturnValue(undefined)

        render(<CookieConsentBanner />)

        await userEvent.click(screen.getByText('manage preferences'))

        expect(screen.getByText('Cookie Preferences')).toBeInTheDocument()
        expect(screen.getByText('Necessary Cookies')).toBeInTheDocument()
    })

    it('saves custom preferences', async () => {
        (Cookies.get as jest.Mock).mockReturnValue(undefined)
        render(<CookieConsentBanner />)

        await userEvent.click(screen.getByText('manage preferences'))

        const checkboxes = screen.getAllByRole('checkbox')
        // 0: necessary (disabled)
        // 1: analytics
        // 2: marketing

        expect(checkboxes[0]).toBeDisabled()
        expect(checkboxes[1]).not.toBeChecked()

        // Check analytics
        await userEvent.click(checkboxes[1])
        expect(checkboxes[1]).toBeChecked()

        await userEvent.click(screen.getByText('Save Preferences'))

        await waitFor(() => {
            expect(Cookies.set).toHaveBeenCalledWith('cookie_consent', 'true', expect.any(Object))
            expect(Cookies.set).toHaveBeenCalledWith('cookie_consent_analytics', 'true', expect.any(Object))
            expect(Cookies.set).toHaveBeenCalledWith('cookie_consent_marketing', 'false', expect.any(Object))
        })
    })
})
