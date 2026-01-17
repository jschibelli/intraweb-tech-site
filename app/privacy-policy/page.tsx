import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="flex-1 flex flex-col justify-center bg-charcoal-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <article className="prose prose-invert max-w-none">
          <h1 className="mb-4">Privacy Policy</h1>
          <p className="mb-10"><strong>Last Updated: January 17, 2026</strong></p>

          <section className="mb-10">
            <h2>Our Approach to Privacy</h2>
            <p>
              IntraWeb Technologies LLC (&quot;IntraWeb,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates as an embedded operations consulting firm. We take data privacy seriously because trust is foundational to our client partnerships. This policy explains what information we collect, how we use it, and your rights regarding that information.
            </p>
            <p>
              If you have questions about this policy, email us at <a href="mailto:privacy@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">privacy@intrawebtech.com</a>.
            </p>
          </section>

          <section className="mb-10">
            <h2>Who This Policy Applies To</h2>
            <p>This privacy policy applies to:</p>
            <ul>
              <li>Visitors to our website (intrawebtech.com)</li>
              <li>Prospective clients who engage with our sales process</li>
              <li>Active client organizations and their employees</li>
              <li>Users of our Workant platform (when launched)</li>
            </ul>
            <p>Different data practices apply to each category, detailed below.</p>
          </section>

          <section className="mb-10">
            <h2>Information We Collect</h2>

            <h3>1. Website Visitors</h3>
            <p><strong>Automatically Collected:</strong></p>
            <ul>
              <li>IP address and approximate location (city/region)</li>
              <li>Browser type, device type, operating system</li>
              <li>Pages visited, time spent, referral source</li>
              <li>Cookie identifiers (see Cookie Policy below)</li>
            </ul>

            <p><strong>Tools We Use:</strong></p>
            <ul>
              <li>Google Analytics (anonymized IP tracking)</li>
              <li>HubSpot (forms, chat, CRM tracking)</li>
              <li>Vercel Analytics (performance monitoring)</li>
            </ul>

            <p><strong>Voluntarily Provided:</strong></p>
            <ul>
              <li>Name, email, company name (via contact forms)</li>
              <li>Phone number (if you provide it)</li>
              <li>Any information you share via email or chat</li>
            </ul>

            <h3>2. Prospective Clients</h3>
            <p>During our sales process, we collect:</p>
            <ul>
              <li>Contact information (name, email, phone, company)</li>
              <li>Job title and role</li>
              <li>Company size and industry</li>
              <li>Information about operational challenges (via discovery calls)</li>
              <li>Communication history (emails, meeting notes, proposal feedback)</li>
            </ul>
            <p><strong>Storage:</strong> This information is stored in HubSpot CRM and Google Workspace.</p>

            <h3>3. Active Clients</h3>
            <p>For client engagements, we collect and process:</p>
            <ul>
              <li>Employee contact information (for users involved in workflow redesign)</li>
              <li>Process documentation and workflow data</li>
              <li>System access credentials (stored in encrypted password managers)</li>
              <li>Communication records (email, Slack, project management tools)</li>
              <li>Engagement metrics (time recovered, automation performance)</li>
            </ul>
            <p><strong>Legal Basis:</strong> Client data processing is governed by our Master Services Agreement and specific engagement contracts, which include data processing addendums as needed.</p>

            <h3>4. Workant Platform Users (Future)</h3>
            <p>When Workant launches, we will collect:</p>
            <ul>
              <li>Account information (name, email, organization)</li>
              <li>Usage data (workflows created, automation performance)</li>
              <li>Integration credentials (encrypted, never stored in plain text)</li>
              <li>Billing information (processed via Stripe, not stored on our servers)</li>
            </ul>
            <p>A separate privacy policy specific to Workant will be published prior to launch.</p>
          </section>

          <section className="mb-10">
            <h2>How We Use Your Information</h2>

            <h3>Website Visitors</h3>
            <ul>
              <li>Understand site traffic and improve user experience</li>
              <li>Track marketing campaign effectiveness</li>
              <li>Respond to contact form inquiries</li>
              <li>Send occasional product updates (if you opt in)</li>
            </ul>

            <h3>Prospective Clients</h3>
            <ul>
              <li>Evaluate fit for our services</li>
              <li>Prepare proposals and engagement scopes</li>
              <li>Follow up on conversations and proposals</li>
              <li>Maintain records of business development activities</li>
            </ul>

            <h3>Active Clients</h3>
            <ul>
              <li>Deliver contracted services</li>
              <li>Document workflow improvements and automation implementations</li>
              <li>Track engagement success metrics</li>
              <li>Provide ongoing support and optimization</li>
              <li>Invoice for services rendered</li>
            </ul>

            <h3>All Categories</h3>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud or security threats</li>
              <li>Enforce our terms of service</li>
              <li>Improve our service offerings</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>Data Sharing and Third Parties</h2>
            <p><strong>We do not sell your data. Ever.</strong></p>
            <p>We share data only in these limited circumstances:</p>

            <h3>Service Providers</h3>
            <p>We use third-party tools to operate our business:</p>
            <ul>
              <li><strong>Google Workspace:</strong> Email, document storage, calendar</li>
              <li><strong>HubSpot:</strong> CRM and marketing automation</li>
              <li><strong>Vercel:</strong> Website hosting and analytics</li>
              <li><strong>Stripe:</strong> Payment processing (Workant, when launched)</li>
              <li><strong>n8n Cloud:</strong> Workflow automation orchestration</li>
              <li><strong>Slack:</strong> Team communication and client collaboration</li>
            </ul>
            <p>These providers access data only as needed to provide their services and are bound by confidentiality agreements.</p>

            <h3>Legal Requirements</h3>
            <p>We may disclose information if required by law, court order, or government request, or to protect our legal rights.</p>

            <h3>Business Transfers</h3>
            <p>If IntraWeb is acquired or merged with another company, your information may be transferred as part of that transaction. We will notify you via email and provide options regarding your data.</p>

            <h3>Client Authorization</h3>
            <p>For active client engagements, we may share process documentation or implementation details with your designated team members or authorized third-party systems as directed by you.</p>
          </section>

          <section className="mb-10">
            <h2>Data Retention</h2>
            <p><strong>Website Visitors:</strong> Analytics data is retained for 26 months (Google Analytics default). Contact form submissions are retained indefinitely unless you request deletion.</p>
            <p><strong>Prospective Clients:</strong> CRM records are retained indefinitely for business development purposes. You may request deletion at any time.</p>
            <p><strong>Active Clients:</strong> Engagement data is retained for 7 years after contract completion for legal, tax, and operational purposes. Process documentation may be retained longer if it informs our methodology development.</p>
            <p><strong>Workant Users:</strong> Account data will be retained as long as your account is active, plus 90 days after cancellation. Backup data is purged after 30 days.</p>
          </section>

          <section className="mb-10">
            <h2>Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>

            <h3>All Users</h3>
            <ul>
              <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format (where applicable)</li>
            </ul>

            <h3>Marketing Opt-Out</h3>
            <p>You can unsubscribe from marketing emails using the link in any email footer, or by emailing <a href="mailto:privacy@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">privacy@intrawebtech.com</a>.</p>

            <h3>Cookies</h3>
            <p>You can control cookies through your browser settings. Note that disabling cookies may limit website functionality.</p>

            <h3>Exercising Your Rights</h3>
            <p>To exercise any privacy rights, email <a href="mailto:privacy@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">privacy@intrawebtech.com</a> with your request. We will respond within 30 days (or as required by applicable law).</p>
          </section>

          <section className="mb-10">
            <h2>Security Measures</h2>
            <p>We implement reasonable security measures to protect your data:</p>
            <ul>
              <li><strong>Encryption:</strong> HTTPS for website traffic, encrypted storage for sensitive client data</li>
              <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication for critical systems</li>
              <li><strong>Password Management:</strong> 1Password for credential storage</li>
              <li><strong>Regular Audits:</strong> Periodic security reviews and access log monitoring</li>
              <li><strong>Vendor Standards:</strong> We select service providers with strong security practices</li>
            </ul>
            <p>However, no system is completely secure. If you become aware of a security issue, please report it to <a href="mailto:security@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">security@intrawebtech.com</a> immediately.</p>
          </section>

          <section className="mb-10">
            <h2>International Data Transfers</h2>
            <p>IntraWeb is based in New Jersey, USA. If you are located outside the United States, your information will be transferred to and processed in the US. By using our services, you consent to this transfer.</p>
            <p>For clients in the European Union or UK, we will execute Standard Contractual Clauses or rely on other appropriate transfer mechanisms as required by GDPR.</p>
          </section>

          <section className="mb-10">
            <h2>Children&apos;s Privacy</h2>
            <p>Our services are not directed to individuals under 18. We do not knowingly collect data from children. If you believe we have inadvertently collected information from a minor, contact us immediately at <a href="mailto:privacy@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">privacy@intrawebtech.com</a>.</p>
          </section>

          <section className="mb-10">
            <h2>Cookie Policy</h2>

            <h3>What We Use Cookies For</h3>
            <ul>
              <li><strong>Essential:</strong> Website functionality, security, user authentication</li>
              <li><strong>Analytics:</strong> Google Analytics, Vercel Analytics (performance monitoring)</li>
              <li><strong>Marketing:</strong> HubSpot tracking (forms, chat, page views)</li>
            </ul>

            <h3>Cookie Types</h3>
            <ul>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain until expiration or manual deletion</li>
            </ul>

            <h3>Managing Cookies</h3>
            <p>Most browsers allow you to refuse cookies or delete existing ones. Visit your browser&apos;s help documentation for instructions. Disabling cookies may limit site functionality.</p>
          </section>

          <section className="mb-10">
            <h2>California Privacy Rights (CCPA)</h2>
            <p>If you are a California resident, you have additional rights:</p>
            <ul>
              <li><strong>Right to Know:</strong> Request disclosure of data collected, sold, or shared</li>
              <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt out of sale of personal information (we do not sell data)</li>
              <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
            </ul>
            <p>To exercise these rights, email <a href="mailto:privacy@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">privacy@intrawebtech.com</a> or call (555) 123-4567.</p>
            <p><strong>Authorized Agent:</strong> You may designate an authorized agent to make requests on your behalf. We will require proof of authorization.</p>
          </section>

          <section className="mb-10">
            <h2>European Privacy Rights (GDPR)</h2>
            <p>If you are located in the European Economic Area or UK, you have rights under GDPR:</p>
            <ul>
              <li><strong>Lawful Basis:</strong> We process data based on consent, contract performance, legal obligation, or legitimate business interests</li>
              <li><strong>Data Protection Officer:</strong> For GDPR inquiries, contact <a href="mailto:privacy@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">privacy@intrawebtech.com</a></li>
              <li><strong>Supervisory Authority:</strong> You have the right to lodge a complaint with your local data protection authority</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>Changes to This Policy</h2>
            <p>We may update this privacy policy periodically to reflect changes in our practices or legal requirements. We will post the updated policy on this page with a revised &quot;Last Updated&quot; date.</p>
            <p>For material changes, we will provide notice via email (if we have your email address) or a prominent notice on our website.</p>
          </section>

          <section className="mb-10">
            <h2>Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies before providing any information.</p>
          </section>

          <section className="mb-10">
            <h2>Business Contact Information</h2>
            <p>
              <strong>IntraWeb Technologies LLC</strong><br />
              Fairfield, New Jersey, United States
            </p>
            <p>
              <strong>General Inquiries:</strong> <a href="mailto:info@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">info@intrawebtech.com</a><br />
              <strong>Privacy Inquiries:</strong> <a href="mailto:privacy@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">privacy@intrawebtech.com</a><br />
              <strong>Security Issues:</strong> <a href="mailto:security@intrawebtech.com" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">security@intrawebtech.com</a><br />
              <strong>Phone:</strong> (555) 123-4567
            </p>
          </section>

          <section className="mb-10">
            <h2>Consent</h2>
            <p>By using our website or services, you acknowledge that you have read and understood this privacy policy and consent to our data practices as described.</p>
            <p>If you do not agree with this policy, please discontinue use of our website and services.</p>
          </section>

          <section className="mb-10">
            <p><strong>Effective Date:</strong> January 17, 2026</p>
          </section>

          <section className="mb-10">
            <h2>Appendix: Data Processing Details for Client Engagements</h2>
            <p>For transparency, here&apos;s what we typically access during client engagements:</p>

            <p><strong>Diagnostic Phase:</strong></p>
            <ul>
              <li>Process documentation you provide</li>
              <li>Sample workflow data (anonymized when possible)</li>
              <li>Communication patterns (email volume, meeting frequency)</li>
            </ul>

            <p><strong>Implementation Phase:</strong></p>
            <ul>
              <li>System credentials (encrypted storage, access limited to necessary personnel)</li>
              <li>Workflow automation configurations</li>
              <li>Integration API keys (encrypted, stored in secure vaults)</li>
            </ul>

            <p><strong>Ongoing Partnership:</strong></p>
            <ul>
              <li>Performance metrics (time saved, automation success rates)</li>
              <li>Support tickets and communication logs</li>
              <li>Optimization recommendations and implementation notes</li>
            </ul>

            <p><strong>Data Minimization:</strong> We request only the data necessary to deliver services. We do not access customer data, financial records, or proprietary business information unless explicitly required for the engagement scope and authorized by you in writing.</p>

            <p><strong>Client Control:</strong> You retain ownership of all your data. We act as a data processor under your direction. You may request data export or deletion at any time, subject to contractual retention requirements.</p>
          </section>
        </article>
      </div>
    </main>
  );
}