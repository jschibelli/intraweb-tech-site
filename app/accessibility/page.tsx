import { LegalPageLayout, ContactBlock } from "@/components/LegalPageLayout";

export const metadata = {
  title: "Accessibility",
  description:
    "Our commitment to digital accessibility and how to contact us with feedback.",
  alternates: {
    canonical: "/accessibility",
  },
};

export default function AccessibilityPage() {
  return (
    <LegalPageLayout
      eyebrow="COMMITMENT"
      title="Accessibility Statement"
      lastUpdated="February 2026"
      showToc
    >
      <h2 id="our-commitment">Our Commitment</h2>
      <p>
        IntraWeb Technologies is committed to ensuring digital accessibility for people with disabilities. We continually work to improve the user experience for everyone and apply relevant accessibility standards.
      </p>
      <p>
        We believe that the web should be accessible to all people, regardless of ability. This commitment extends to our website, our client deliverables, and the systems we help implement.
      </p>

      <h2 id="standards-we-follow">Standards We Follow</h2>
      <p>
        We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
      </p>
      <p>The guidelines address:</p>
      <ul>
        <li><strong>Perceivable:</strong> Information and user interface components must be presentable to users in ways they can perceive</li>
        <li><strong>Operable:</strong> User interface components and navigation must be operable</li>
        <li><strong>Understandable:</strong> Information and the operation of the user interface must be understandable</li>
        <li><strong>Robust:</strong> Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies</li>
      </ul>

      <h2 id="accessibility-features">Accessibility Features</h2>
      <p>Our website includes the following accessibility features:</p>

      <h3>Navigation and Structure</h3>
      <ul>
        <li>Consistent navigation across all pages</li>
        <li>Logical heading hierarchy (H1, H2, H3)</li>
        <li>Skip-to-content link for keyboard users</li>
        <li>Descriptive page titles</li>
        <li>Breadcrumb navigation where appropriate</li>
      </ul>

      <h3>Visual Design</h3>
      <ul>
        <li>Sufficient color contrast ratios (minimum 4.5:1 for normal text)</li>
        <li>Text can be resized up to 200% without loss of functionality</li>
        <li>No content relies solely on color to convey meaning</li>
        <li>Focus indicators visible on all interactive elements</li>
        <li>Reduced motion option respected for users who prefer it</li>
      </ul>

      <h3>Keyboard Accessibility</h3>
      <ul>
        <li>All functionality available via keyboard</li>
        <li>Logical tab order through page elements</li>
        <li>No keyboard traps</li>
        <li>Visible focus states on all interactive elements</li>
      </ul>

      <h3>Screen Reader Support</h3>
      <ul>
        <li>Semantic HTML markup</li>
        <li>ARIA labels where appropriate</li>
        <li>Alt text for all meaningful images</li>
        <li>Form inputs properly labeled</li>
        <li>Error messages associated with form fields</li>
      </ul>

      <h3>Forms and Interactions</h3>
      <ul>
        <li>Clear labels for all form fields</li>
        <li>Error messages that identify the issue and suggest corrections</li>
        <li>Sufficient time to complete forms</li>
        <li>Confirmation of successful form submissions</li>
      </ul>

      <h2 id="assistive-technologies">Assistive Technologies</h2>
      <p>Our website is designed to be compatible with:</p>
      <ul>
        <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
        <li>Screen magnification software</li>
        <li>Speech recognition software</li>
        <li>Keyboard-only navigation</li>
        <li>Browser accessibility extensions</li>
      </ul>

      <h2 id="known-limitations">Known Limitations</h2>
      <p>
        While we strive for full accessibility, we are aware of the following limitations:
      </p>
      <ul>
        <li>Some older PDF documents may not be fully accessible. If you need an accessible version of any document, please contact us</li>
        <li>Third-party content embedded on our site may not meet our accessibility standards</li>
      </ul>
      <p>We are actively working to address these limitations.</p>

      <h2 id="feedback-and-assistance">Feedback and Assistance</h2>
      <p>
        We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:accessibility@intrawebtech.com">accessibility@intrawebtech.com</a>
      </p>
      <p>
        <strong>Response time:</strong> We aim to respond to accessibility feedback within 2 business days.
      </p>
      <p>When contacting us, please include:</p>
      <ul>
        <li>The web address (URL) of the content</li>
        <li>A description of the issue you encountered</li>
        <li>The assistive technology you were using (if applicable)</li>
        <li>Your contact information</li>
      </ul>

      <h2 id="alternative-formats">Alternative Formats</h2>
      <p>
        If you need information from our website in an alternative format, please contact us. We will work with you to provide the information in a format that meets your needs, such as:
      </p>
      <ul>
        <li>Large print</li>
        <li>Plain text</li>
        <li>Audio description</li>
      </ul>

      <h2 id="continuous-improvement">Continuous Improvement</h2>
      <p>Accessibility is an ongoing effort. We regularly:</p>
      <ul>
        <li>Review our website for accessibility issues</li>
        <li>Train our team on accessibility best practices</li>
        <li>Incorporate accessibility into our development process</li>
        <li>Test with assistive technologies</li>
        <li>Gather and act on user feedback</li>
      </ul>

      <h2 id="accessibility-in-our-client-work">Accessibility in Our Client Work</h2>
      <p>
        Our commitment to accessibility extends to the work we do for clients. When implementing workflow automation and operational systems, we advocate for accessible design and can incorporate accessibility requirements into project scope.
      </p>

      <h2 id="learn-more">Learn More</h2>
      <p>For more information about web accessibility, we recommend:</p>
      <ul>
        <li>
          <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
            Web Content Accessibility Guidelines (WCAG) 2.1
          </a>
        </li>
        <li>
          <a href="https://webaim.org/" target="_blank" rel="noopener noreferrer">
            WebAIM — Web Accessibility In Mind
          </a>
        </li>
        <li>
          <a href="https://www.a11yproject.com/" target="_blank" rel="noopener noreferrer">
            A11Y Project
          </a>
        </li>
      </ul>

      <ContactBlock
        heading="Help us improve"
        text="Found an accessibility issue? Let us know at"
        email="accessibility@intrawebtech.com"
        variant="warm"
      />
    </LegalPageLayout>
  );
}
