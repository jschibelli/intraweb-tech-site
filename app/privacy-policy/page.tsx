

export default function PrivacyPolicy() {
  return (
    <main className="flex-1 flex flex-col justify-center bg-charcoal-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <article className="prose prose-invert">
          <h1 className="mb-10">Privacy Policy</h1>
          <p className="mb-10">Last updated: April 2025</p>
          <section className="mb-10">
            <h2>Personal Data Collection</h2>
            <p>We collect personal data through various means, including:</p>
            <ul>
              <li>Contact form submissions (name, email, company)</li>
              <li>Website analytics (IP address, browser type, pages visited)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Newsletter subscriptions</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Lawful Bases for Processing</h2>
            <p>We process your personal data based on the following legal grounds:</p>
            <ul>
              <li>Your consent (for marketing communications)</li>
              <li>Legitimate interests (for website analytics and security)</li>
              <li>Contractual necessity (for service delivery)</li>
              <li>Legal obligations (for compliance purposes)</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Data Retention</h2>
            <p>We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements. Typically:</p>
            <ul>
              <li>Contact form submissions: 2 years</li>
              <li>Analytics data: 26 months</li>
              <li>Marketing preferences: Until withdrawn</li>
              <li>Cookies: As specified in our cookie policy</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Third-Party Data Sharing</h2>
            <p>We may share your data with the following third parties:</p>
            <ul>
              <li>Google Analytics (website usage analysis)</li>
              <li>HubSpot (CRM and marketing automation)</li>
              <li>Cloudflare (website security and performance)</li>
              <li>Payment processors (if applicable)</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Your Rights</h2>
            <p>Under GDPR and CCPA, you have the following rights:</p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Contact Us</h2>
            <p>
              For any privacy-related inquiries or to exercise your rights, please contact us at:{' '}
              <a href="mailto:contact@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">contact@intrawebtech.com</a>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
} 