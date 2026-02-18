import { render, screen } from '../../utils/test-utils'
import Hero from '@/components/Hero'
import type { HeroContent } from '@/components/Hero'

const mockHeroContent: HeroContent = {
  heading: 'Test Heading',
  subheading: 'Test Subheading',
  cta: { label: 'Test CTA', href: '/test-link' },
  announcement: { label: 'Announcement', href: '/contact' },
  clientLogos: [],
}

describe('Hero', () => {
  it('renders hero content from props', () => {
    render(<Hero content={mockHeroContent} />)

    expect(screen.getByText('Test Heading')).toBeInTheDocument()
    expect(screen.getByText('Test Subheading')).toBeInTheDocument()

    const ctaLink = screen.getByRole('link', { name: /test cta/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/test-link')
  })

  it('renders announcement link', () => {
    render(<Hero content={mockHeroContent} />)
    const announcementLink = screen.getByRole('link', { name: /announcement/i })
    expect(announcementLink).toBeInTheDocument()
    expect(announcementLink).toHaveAttribute('href', '/contact')
  })

  it('renders metric when provided', () => {
    const withMetric = { ...mockHeroContent, metric: { value: '95%', label: 'Success rate' } }
    render(<Hero content={withMetric} />)
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('Success rate')).toBeInTheDocument()
  })
})
