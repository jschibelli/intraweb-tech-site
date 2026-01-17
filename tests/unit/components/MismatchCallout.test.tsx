import { render, screen } from '../../utils/test-utils'
import MismatchCallout from '@/components/MismatchCallout'

describe('MismatchCallout', () => {
    it('renders children content', () => {
        render(
            <MismatchCallout>
                <p>Test content</p>
            </MismatchCallout>
        )

        expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
        render(
            <MismatchCallout>
                <p>First paragraph</p>
                <p>Second paragraph</p>
            </MismatchCallout>
        )

        expect(screen.getByText('First paragraph')).toBeInTheDocument()
        expect(screen.getByText('Second paragraph')).toBeInTheDocument()
    })

    it('renders complex children structures', () => {
        render(
            <MismatchCallout>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            </MismatchCallout>
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
        expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('renders empty when no children provided', () => {
        const { container } = render(<MismatchCallout children={undefined} />)

        // Container should exist but be mostly empty
        expect(container.firstChild).toBeInTheDocument()
    })
})
