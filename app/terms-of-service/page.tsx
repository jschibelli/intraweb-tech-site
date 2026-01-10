import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="flex-1 flex flex-col justify-center bg-charcoal-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <article className="prose prose-invert">
          <h1 className="mb-10">Terms of Service</h1>
          <p className="mb-10">Last updated: April 2025</p>
          <section className="mb-10">
            <h2>Acceptance of Terms</h2>
            <p>By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use our site.</p>
          </section>
          <section className="mb-10">
            <h2>Use of the Site</h2>
            <ul>
              <li>You may use the site for lawful purposes only.</li>
              <li>You agree not to misuse the site or interfere with its operation.</li>
              <li>You must not attempt to gain unauthorized access to any part of the site.</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Intellectual Property</h2>
            <p>All content, trademarks, logos, and intellectual property on this site are owned by IntraWeb Technologies or its licensors. You may not use, reproduce, or distribute any content without our written permission.</p>
          </section>
          <section className="mb-10">
            <h2>User Obligations</h2>
            <ul>
              <li>Provide accurate and current information if requested.</li>
              <li>Comply with all applicable laws and regulations.</li>
              <li>Do not use the site for any unlawful or prohibited purpose.</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Disclaimers</h2>
            <ul>
              <li>The site is provided on an &quot;as is&quot; and &quot;as available&quot; basis.</li>
              <li>We do not warrant that the site will be error-free or uninterrupted.</li>
              <li>We are not responsible for the accuracy, reliability, or completeness of any content.</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, IntraWeb Technologies and its affiliates shall not be liable for any damages arising from your use of the site.</p>
          </section>
          <section className="mb-10">
            <h2>Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. Changes will be effective upon posting to this page. Your continued use of the site constitutes acceptance of the new terms.</p>
          </section>
          <section className="mb-10">
            <h2>Governing Law</h2>
            <p>These Terms are governed by the laws of the jurisdiction in which IntraWeb Technologies operates, without regard to conflict of law principles.</p>
          </section>
          <section className="mb-10">
            <h2>Contact Us</h2>
            <p>If you have any questions about these Terms, please <Link href="/contact" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">contact us</Link>.</p>
          </section>
        </article>
      </div>
    </main>
  );
} 