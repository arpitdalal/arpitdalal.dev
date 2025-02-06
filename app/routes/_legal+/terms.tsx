import { Link } from "react-router";
import ExternalLink from "#app/components/external-link";
import {
  HeroHighlight,
  HeroHighlightDescription,
  HeroHighlightH1,
} from "#app/components/highlight";
import { LineGlow } from "#app/components/line-glow";

export default function PrivacyPolicy() {
  return (
    <>
      <HeroHighlight className="pt-24">
        <div className="flex flex-col items-center justify-between gap-6">
          <HeroHighlightH1>
            <span className="first-letter:text-primary">Terms</span>
            <span>of Service</span>
          </HeroHighlightH1>
          <HeroHighlightDescription>
            Everything here is provided for free of charge.
          </HeroHighlightDescription>
        </div>
      </HeroHighlight>
      <section id="contact">
        <LineGlow />
        <div className="container">
          <div className="prose mx-auto dark:prose-invert">
            <p>Last updated: 2025-02-06</p>
            <p>
              This website is completely open-source, you can read the code on{" "}
              <ExternalLink href="https://github.com/arpitdalal/arpitdalal.dev">
                GitHub
              </ExternalLink>
              .
            </p>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using arpitdalal.dev (“the Site”), you agree to
              be bound by these Terms of Service (“Terms”) and{" "}
              <Link to="/privacy">Privacy Policy</Link>. If you do not agree to
              these Terms, please do not use the Site.
            </p>
            <h2>2. Website Purpose</h2>
            <p>
              The Site is a personal developer portfolio maintained by Arpit
              Dalal (“me,” “I,” or “my”). The Site is provided for informational
              and demonstration purposes. I reserve the right to modify or
              discontinue the Site (or any part of it) at any time without
              notice.
            </p>
            <h2>3. User Conduct</h2>
            <p>
              You agree to use the Site only for lawful purposes. You shall not:
            </p>
            <ul>
              <li>
                Use the Site in any way that could damage, disable, or impair
                the Site’s operation.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Site or
                related systems.
              </li>
              <li>
                Submit any malicious content or engage in activities that may
                compromise security.
              </li>
            </ul>
            <h2>4. Intellectual Property</h2>
            <p>
              All content on the Site—including text, graphics, logos, images,
              and code—is the property of Arpit Dalal or used with permission.
              You may view and share content for your personal, non-commercial
              use only. Any other use is prohibited unless expressly authorized
              in writing.
            </p>
            <h2>5. No Data Storage Commitment</h2>
            <p>
              Please note that although the Site includes interactive elements
              such as a contact form and newsletter subscription, I do not store
              any information submitted via these forms on my servers. For
              instance, contact form submissions are sent directly to my email
              and are not retained on the Site.
            </p>
            <h2>6. Disclaimers and Limitation of Liability</h2>
            <p>
              The Site is provided “as is” and “as available.” I make no
              warranties regarding the accuracy, reliability, or suitability of
              the Site for any purpose. In no event shall I be liable for any
              direct, indirect, or incidental damages arising from your use of
              the Site. Your use is at your sole risk.
            </p>
            <h2>7. Modifications</h2>
            <p>
              I may update these Terms from time to time. Any changes will be
              posted on the Site with a new effective date. Your continued use
              of the Site following any modifications signifies your acceptance
              of the new terms.
            </p>
            <h2>8. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of Ontario, Canada. Any disputes arising from these Terms
              shall be resolved exclusively in the courts of Ontario.
            </p>
            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact me at:
              <ExternalLink
                href="mailto:arpit@arpitdalal.dev"
                className="block"
              >
                arpit@arpitdalal.dev
              </ExternalLink>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
