import { LegalPageLayout, ContactBlock } from "@/components/LegalPageLayout";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How IntraWeb Technologies collects, uses, and protects your personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="LEGAL"
      title="Privacy Policy"
      lastUpdated="February 2026"
      showToc
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        IntraWeb Technologies LLC (&ldquo;IntraWeb,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website intrawebtech.com or engage our services.
      </p>
      <p>
        Please read this Privacy Policy carefully. By accessing or using our website or services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
      </p>

      <h2 id="information-we-collect">Information We Collect</h2>

      <h3>Information You Provide Directly</h3>
      <p>We collect information you voluntarily provide when you:</p>
      <ul>
        <li>Fill out our contact form</li>
        <li>Request a diagnostic consultation</li>
        <li>Enter into a service agreement with us</li>
        <li>Communicate with us via email or other channels</li>
      </ul>
      <p>This information may include:</p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Company name</li>
        <li>Phone number</li>
        <li>Job title</li>
        <li>Information about your business operations and challenges</li>
        <li>Payment information (processed securely through third-party providers)</li>
      </ul>

      <h3>Information Collected Automatically</h3>
      <p>
        When you visit our website, we may automatically collect certain information about your device and usage, including:
      </p>
      <ul>
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Pages visited and time spent on pages</li>
        <li>Referring website addresses</li>
        <li>Date and time of visits</li>
      </ul>
      <p>
        We collect this information using cookies and similar tracking technologies. See our Cookie Policy section below for more details.
      </p>

      <h2 id="how-we-use-your-information">How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Respond to your inquiries and provide requested services</li>
        <li>Deliver diagnostic assessments and implementation services</li>
        <li>Send administrative information, such as engagement updates and invoices</li>
        <li>Improve our website and services</li>
        <li>Analyze usage patterns to enhance user experience</li>
        <li>Comply with legal obligations</li>
        <li>Protect against fraudulent or unauthorized activity</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2 id="cookie-policy">Cookie Policy</h2>
      <p>
        Our website uses cookies and similar tracking technologies to enhance your browsing experience.
      </p>

      <h3>Essential Cookies</h3>
      <p>
        Required for the website to function properly. These cannot be disabled. They include cookies for:
      </p>
      <ul>
        <li>Session management</li>
        <li>Security features</li>
        <li>Cookie consent preferences</li>
      </ul>

      <h3>Analytics Cookies</h3>
      <p>
        Help us understand how visitors interact with our website. We use these to improve our site and services. These are only activated with your consent.
      </p>
      <p>
        We use Google Analytics to analyze website traffic. You can opt out of Google Analytics by installing the{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
          Google Analytics Opt-out Browser Add-on
        </a>.
      </p>

      <h3>Marketing Cookies</h3>
      <p>
        Used to deliver relevant content and measure the effectiveness of our marketing efforts. These are only activated with your consent.
      </p>

      <h3>Managing Your Cookie Preferences</h3>
      <p>
        You can manage your cookie preferences at any time by clicking the &ldquo;Cookie Preferences&rdquo; link in our website footer or adjusting your browser settings.
      </p>

      <h2 id="data-sharing-and-disclosure">Data Sharing and Disclosure</h2>
      <p>We may share your information with:</p>

      <h3>Service Providers</h3>
      <p>Third-party vendors who perform services on our behalf, such as:</p>
      <ul>
        <li>Payment processing</li>
        <li>Email delivery</li>
        <li>Website hosting and analytics</li>
        <li>Customer relationship management</li>
      </ul>
      <p>
        These providers are contractually obligated to protect your information and use it only for the services they provide to us.
      </p>

      <h3>Legal Requirements</h3>
      <p>
        We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of IntraWeb, our clients, or others.
      </p>

      <h3>Business Transfers</h3>
      <p>
        In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.
      </p>

      <h2 id="data-security">Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
      </p>
      <ul>
        <li>Encrypted data transmission (SSL/TLS)</li>
        <li>Secure data storage with access controls</li>
        <li>Regular security assessments</li>
        <li>Employee training on data protection</li>
      </ul>
      <p>
        However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
      </p>

      <h2 id="data-retention">Data Retention</h2>
      <p>
        We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
      </p>
      <p>
        For clients, we retain engagement records and related documentation for seven years following the completion of services, as required for business and legal purposes.
      </p>

      <h2 id="your-rights">Your Rights</h2>
      <p>
        Depending on your location, you may have the following rights regarding your personal information:
      </p>
      <ul>
        <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
        <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
        <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
        <li><strong>Portability:</strong> Request transfer of your information to another service provider</li>
      </ul>
      <p>To exercise any of these rights, please contact us at the address below.</p>

      <h2 id="california-privacy-rights">California Privacy Rights</h2>
      <p>
        If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with additional rights regarding your personal information:
      </p>
      <ul>
        <li>Right to know what personal information we collect, use, and disclose</li>
        <li>Right to request deletion of your personal information</li>
        <li>Right to opt out of the sale of personal information (we do not sell personal information)</li>
        <li>Right to non-discrimination for exercising your privacy rights</li>
      </ul>
      <p>To submit a request, please contact us using the information below.</p>

      <h2 id="childrens-privacy">Children&apos;s Privacy</h2>
      <p>
        Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
      </p>

      <h2 id="international-data-transfers">International Data Transfers</h2>
      <p>
        If you are accessing our website from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States. By using our website or services, you consent to this transfer.
      </p>

      <h2 id="changes-to-this-privacy-policy">Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website with a new &ldquo;Last updated&rdquo; date.
      </p>
      <p>We encourage you to review this Privacy Policy periodically.</p>

      <h2 id="contact-us">Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
      </p>
      <p>
        <strong>IntraWeb Technologies LLC</strong><br />
        Email: <a href="mailto:privacy@intrawebtech.com">privacy@intrawebtech.com</a><br />
        General inquiries: <a href="mailto:contact@intrawebtech.com">contact@intrawebtech.com</a>
      </p>
      <p>
        For data subject requests, please email{" "}
        <a href="mailto:privacy@intrawebtech.com">privacy@intrawebtech.com</a>{" "}
        with &ldquo;Data Subject Request&rdquo; in the subject line.
      </p>

      <ContactBlock
        heading="Questions about your data?"
        text="Contact our privacy team at"
        email="privacy@intrawebtech.com"
      />
    </LegalPageLayout>
  );
}
