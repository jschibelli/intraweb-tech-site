import Link from 'next/link';

export const metadata = {
  title: "Careers at IntraWeb Technologies | Open Positions",
  description: "Join IntraWeb Technologies and help us transform how businesses operate. View our open positions in automation engineering, development, operations, and marketing.",
  openGraph: {
    title: "Careers at IntraWeb Technologies",
    description: "Join our team and help us transform how businesses operate through automation and AI-powered solutions.",
    type: "website",
    url: "https://intrawebtech.com/careers",
  },
};

const jobListings = [
  {
    title: "Senior Automation Engineer",
    slug: "senior-automation-engineer",
    type: "Full-time",
    location: "Remote (US preferred)",
    compensation: "$110K-$145K",
    description: "Design and deploy workflow automation that eliminates coordination drag for SMB clients. You're an operational architect who happens to use code.",
  },
  {
    title: "Full-Stack Developer",
    slug: "full-stack-developer",
    type: "Full-time",
    location: "Remote (US preferred)",
    compensation: "$115K-$155K",
    description: "Build the Workant platform—our developer workflow automation tool. Greenfield work with Next.js, React, TypeScript, and PostgreSQL.",
  },
  {
    title: "Operations Analyst",
    slug: "operations-analyst",
    type: "Full-time",
    location: "Remote (US preferred)",
    compensation: "$85K-$115K",
    description: "Bridge our automation capabilities with client needs. Map processes, identify bottlenecks, and ensure engagements deliver measurable results.",
  },
  {
    title: "Marketing & Content Strategist",
    slug: "marketing-content-strategist",
    type: "Full-time",
    location: "Remote (US preferred)",
    compensation: "$95K-$125K",
    description: "Own our go-to-market strategy and content engine. Build credibility in operational transformation through education, not persuasion.",
  },
  {
    title: "Business Development Representative",
    slug: "business-development-rep",
    type: "Full-time",
    location: "Remote (US preferred)",
    compensation: "$70K + $35K-$50K commission",
    description: "Identify and qualify prospects drowning in coordination overhead. Research-driven outbound, not cold calling at scale.",
  },
];

export default function CareersPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="careers-hero careers-bg-primary">
        <div className="careers-hero-pattern" aria-hidden="true" />
        <div className="careers-container careers-hero-content">
          <h1 className="careers-page-title">Join Our Team</h1>
          <p className="careers-lead-text">
            We're building something real—a company that transforms how businesses operate.
            If you're excited by the challenge of turning operational chaos into clarity,
            we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Open Positions */}
      <section className="careers-section careers-bg-alternate">
        <div className="careers-wide-container">
          <h2 className="careers-section-title">Open Positions</h2>
          <div className="careers-jobs-grid">
            {jobListings.map((job) => (
              <Link
                key={job.slug}
                href={`/careers/${job.slug}`}
                className="careers-job-card"
              >
                <h3 className="careers-job-card-title">{job.title}</h3>
                <div className="careers-job-card-meta">
                  <span className="careers-badge careers-badge-type">{job.type}</span>
                  <span className="careers-badge careers-badge-location">{job.location}</span>
                  <span className="careers-badge careers-badge-compensation">{job.compensation}</span>
                </div>
                <p className="careers-job-card-description">{job.description}</p>
                <span className="careers-job-card-link">View Details</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="careers-section careers-bg-primary">
        <div className="careers-container">
          <h2 className="careers-section-title">What We Offer</h2>

          <div className="careers-benefits-grid">
            <div className="careers-benefit-category">
              <h3 className="careers-benefit-title">Compensation</h3>
              <ul className="careers-list">
                <li>Market-competitive, US-adjusted rates</li>
                <li>Performance-based growth with annual reviews</li>
                <li>Transparent salary bands—no negotiation games</li>
              </ul>
            </div>

            <div className="careers-benefit-category">
              <h3 className="careers-benefit-title">Benefits</h3>
              <ul className="careers-list">
                <li>Health, dental, vision (80% premium coverage)</li>
                <li>401(k) with 3% company match</li>
                <li>15 days PTO + 10 holidays + 5 sick days</li>
                <li>$2,000/year professional development budget</li>
              </ul>
            </div>

            <div className="careers-benefit-category">
              <h3 className="careers-benefit-title">Work Setup</h3>
              <ul className="careers-list">
                <li>$1,500 one-time home office stipend</li>
                <li>Company-provided laptop and equipment</li>
                <li>Quarterly team gatherings (locations vary)</li>
              </ul>
            </div>

            <div className="careers-benefit-category">
              <h3 className="careers-benefit-title">Work Environment</h3>
              <ul className="careers-list">
                <li>Remote-first with occasional on-site collaboration</li>
                <li>Async-first—we don't do unnecessary meetings</li>
                <li>Trust-based culture for adults</li>
                <li>Transparency in financials, roadmap, and strategy</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="careers-section careers-bg-alternate">
        <div className="careers-container">
          <h2 className="careers-section-title">What We Value</h2>
          <ul className="careers-philosophy-list">
            <li><strong>Operator mindset:</strong> You solve problems, not just execute tasks</li>
            <li><strong>Intellectual honesty:</strong> You admit what you don't know and figure it out</li>
            <li><strong>Systems thinking:</strong> You see connections, not just isolated issues</li>
            <li><strong>Low ego, high standards:</strong> You want to build something that works</li>
          </ul>

          <hr className="careers-hr" />

          <h3 className="careers-subsection-title">What We Don't Care About</h3>
          <ul className="careers-list">
            <li>Where you went to school—we've never asked</li>
            <li>Big-name companies on your resume—startups, agencies, and weird paths are valid</li>
            <li>Years of experience—if you can do the job well, the number doesn't matter</li>
          </ul>
        </div>
      </section>

      {/* How to Apply */}
      <section className="careers-section careers-bg-primary">
        <div className="careers-container">
          <h2 className="careers-section-title">How to Apply</h2>

          <div className="careers-apply-box">
            <p className="careers-body-text" style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#ffffff' }}>Email:</strong>{' '}
              <a href="mailto:careers@intrawebtech.com" className="careers-apply-email">
                careers@intrawebtech.com
              </a>
            </p>

            <h3 className="careers-subsection-title">Include:</h3>
            <ul className="careers-list">
              <li>Which role you're applying for (one role per application)</li>
              <li>Why this role in 2-3 sentences (not why you want a job—why THIS job)</li>
              <li>Relevant work: portfolio, GitHub, writing samples, case studies</li>
              <li>Your resume (PDF preferred)</li>
            </ul>

            <h3 className="careers-subsection-title" style={{ marginTop: '1.5rem' }}>What NOT to Include:</h3>
            <ul className="careers-list">
              <li>Generic cover letters</li>
              <li>"I'm passionate about..." statements without substance</li>
              <li>Applications for multiple roles simultaneously</li>
            </ul>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 className="careers-subsection-title">Timeline</h3>
            <ul className="careers-list">
              <li>Applications reviewed weekly (Fridays)</li>
              <li>First-round interviews scheduled within 1 week of review</li>
              <li>Total process: 2-3 weeks from application to offer</li>
            </ul>
          </div>

          <hr className="careers-hr" />

          <h3 className="careers-subsection-title">Questions?</h3>
          <ul className="careers-list">
            <li>General inquiries: <a href="mailto:careers@intrawebtech.com" style={{ color: '#14b8a6' }}>careers@intrawebtech.com</a></li>
            <li>Want to learn more? Check out our case studies and blog</li>
          </ul>
        </div>
      </section>
    </main>
  );
}