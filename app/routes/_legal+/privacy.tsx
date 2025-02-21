import { ExternalLink } from '#app/components/external-link'
import {
	HeroHighlight,
	HeroHighlightDescription,
	HeroHighlightH1,
} from '#app/components/highlight'
import { LineGlow } from '#app/components/line-glow'

export default function PrivacyPolicy() {
	return (
		<>
			<HeroHighlight className="pt-24">
				<div className="flex flex-col items-center justify-between gap-6">
					<HeroHighlightH1>
						<span className="first-letter:text-primary">Privacy</span>
						<span>Policy</span>
					</HeroHighlightH1>
					<HeroHighlightDescription>
						I am transparent about the data I collect and how it is used.
					</HeroHighlightDescription>
				</div>
			</HeroHighlight>
			<section id="privacy">
				<LineGlow />
				<div className="container">
					<div className="prose dark:prose-invert mx-auto">
						<p>Last updated: 2025-02-06</p>
						<p>
							This website is completely open-source, you can read the code on{' '}
							<ExternalLink href="https://github.com/arpitdalal/arpitdalal.dev">
								GitHub
							</ExternalLink>
							.
						</p>
						<h2>1. Introduction</h2>
						<p>
							This Privacy Policy explains how Arpit Dalal (“me”, “I”, or “my”)
							handles information related to my website, arpitdalal.dev (the
							“Site”). By using the Site, you consent to the practices described
							herein. Importantly, the Site does not store any personal
							information on its own servers.
						</p>
						<h2>2. Information Collection and Storage</h2>
						<p>
							I collect non-personal information automatically when you visit
							the Site. This information may include:
						</p>
						<h3>Contact Form:</h3>
						<p>
							When you use the contact form, the information you provide (such
							as your name, email address, and message) is transmitted directly
							to my designated email address (or another processing mechanism)
							and is not stored on the Site.
						</p>
						<h3>Newsletter Signup:</h3>
						<p>
							When you subscribe to my newsletter, your email address is
							forwarded directly to my third-party service (Hashnode) for the
							purpose of managing my blog and newsletter. This information is
							not stored on the Site itself. You can visit the{' '}
							<ExternalLink href="https://hashnode.com/privacy">
								Hashnode Privacy Policy
							</ExternalLink>{' '}
							to learn more about how Hashnode handles your data.
						</p>
						<h3>Analytics:</h3>
						<p>
							I use PostHog and Umami for website analytics. These services
							collect non-personally identifying data to help me analyze and
							improve the Site. The data collected by PostHog is not stored by
							me on my servers. I self-host Umami so I do store data on my
							servers. Both services are privacy-focused and collect only
							anonymous data.
							{ENV?.UMAMI_PUBLIC_ANALYTICS_URL ? (
								<>
									Umami enables me to make analytics data publicly accessible.
									You can review{' '}
									<ExternalLink href={ENV.UMAMI_PUBLIC_ANALYTICS_URL}>
										all the data it collects
									</ExternalLink>
									.
								</>
							) : null}
						</p>
						<h3>3. How I Use Your Information</h3>
						<p>
							Since the Site does not store any user-submitted information, I do
							not maintain or process personal data on my own servers.
							Third-party systems manage the respective data flows:
						</p>
						<ul>
							<li>
								Contact Form: Data is used solely to forward your inquiry to my
								email; no storage occurs.
							</li>
							<li>
								Newsletter Subscription: Data is used to manage and send you my
								newsletter; Hashnode stores this data.
							</li>
							<li>
								Analytics: Data is used to understand visitor trends and improve
								the Site's performance; PostHog and Umami store this data in an
								anonymous format.
							</li>
						</ul>
						<h3>4. Third-Party Services</h3>
						<p>
							I do not sell or share your personal information. Any personal
							data that may be processed (e.g., your email address when
							subscribing to my newsletter) is handled by third-party service
							providers, such as Hashnode for email management and PostHog for
							analytics. Please review their privacy policies for more details
							on their practices.
						</p>
						<h3>5. Data Security</h3>
						<p>
							While the Site itself does not store personal information, any
							data transmitted via our forms is sent through secure channels
							(e.g., HTTPS). I take reasonable technical measures to ensure that
							transmissions are secure; however, no method of transmission over
							the Internet is completely secure.
						</p>
						<h3>6. Data Retention</h3>
						<p>
							Because the Site does not store personal data, I do not maintain
							records of user submissions. Data provided via forms is used in
							real-time (e.g., sent directly to an email) and is not retained on
							our Site.
						</p>
						<h3>7. Your Rights</h3>
						<p>
							Under Canadian privacy law (such as PIPEDA), you have the right to
							inquire about or request changes to any personal data held by
							third-party service providers. Since the Site itself does not
							store your data, any such requests should be directed to the
							appropriate third party. For questions, please contact me using
							the information below.
						</p>
						<h3>8. Cookies and Tracking Technologies</h3>
						<p>
							My Site uses cookies and similar technologies to facilitate its
							operation and analytics. Cookies help in understanding visitor
							behavior; however, they do not identify you personally. You may
							adjust your browser settings to refuse cookies, but this might
							affect your ability to use certain features of the Site such as
							using system theme.
						</p>
						<h3>9. Changes to This Privacy Policy</h3>
						<p>
							I may update this Privacy Policy periodically to reflect changes
							in my practices or applicable law. The updated policy will be
							posted on this page with a new “Last Updated” date. I encourage
							you to review this policy periodically.
						</p>
						<h3>10. Contact Me</h3>
						<p>
							If you have any questions or concerns about this Privacy Policy or
							my data practices, please contact me at:
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
	)
}
