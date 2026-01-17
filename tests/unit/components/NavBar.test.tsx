import { render, screen } from '../../utils/test-utils'
import { NavBar } from '@/components/NavBar'

describe('NavBar', () => {
    it('renders navigation links', () => {
        render(<NavBar />)

        expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    })

    it('renders logo with link to home', () => {
        render(<NavBar />)

        const logoLink = screen.getByRole('link', { name: /IntraWeb Technologies Logo/i })
        expect(logoLink).toBeInTheDocument()
        expect(logoLink).toHaveAttribute('href', '/')

        const logoImage = screen.getByAltText(/IntraWeb Technologies Logo/i)
        expect(logoImage).toBeInTheDocument()
    })

    it('has semantic nav element', () => {
        render(<NavBar />)

        expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
    })
})
