

export default function AccessibilityStatement() {
  return (
    <main className="flex-1 flex flex-col justify-center bg-charcoal-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <article className="prose prose-invert">
          <h1 className="mb-10">Accessibility Statement</h1>
          <section className="mb-10">
            <h2>Our Commitment</h2>
            <p>
              IntraWeb Technologies is committed to ensuring digital accessibility for people of all abilities. We strive to continually improve the user experience for everyone and apply relevant accessibility standards.
            </p>
          </section>
          <section className="mb-10">
            <h2>WCAG 2.1 AA Compliance</h2>
            <p>
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our efforts include:
            </p>
            <ul>
              <li>Providing text alternatives for non-text content</li>
              <li>Ensuring content is adaptable and distinguishable</li>
              <li>Making all functionality available from a keyboard</li>
              <li>Providing ways to help users navigate and find content</li>
              <li>Making text readable and understandable</li>
              <li>Ensuring content appears and operates in predictable ways</li>
              <li>Maximizing compatibility with current and future user tools</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Known Accessibility Gaps</h2>
            <p>
              While we strive to ensure that our website is fully accessible, some content may not be fully accessible due to limitations or areas that are currently under improvement. We are continuously working to address these issues and improve our website&apos;s accessibility.
            </p>
          </section>
          <section className="mb-10">
            <h2>Keyboard Navigation</h2>
            <p>
              Our website can be navigated using a keyboard. Here are some key navigation features:
            </p>
            <ul>
              <li>Use Tab to move forward through interactive elements</li>
              <li>Use Shift + Tab to move backward</li>
              <li>Use Enter or Space to activate buttons and links</li>
              <li>Use arrow keys to navigate through dropdown menus</li>
              <li>Use Escape to close modals and dropdowns</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Assistive Technologies</h2>
            <p>
              Our website is designed to be compatible with:
            </p>
            <ul>
              <li>Screen readers (e.g., NVDA, VoiceOver, JAWS)</li>
              <li>Screen magnifiers</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2>Feedback and Contact</h2>
            <p>
              We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us at:{' '}
              <a
                href="mailto:contact@intrawebtech.com"
                className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200"
              >
                contact@intrawebtech.com
              </a>
            </p>
          </section>
          <section className="mb-10">
            <h2>Continuous Improvement</h2>
            <p>
              We regularly review our website for accessibility and make necessary improvements. This accessibility statement was last updated on {new Date().toLocaleDateString()}.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
} 