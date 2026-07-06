import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HyperrLogo from "@/components/HyperrLogo";
import { useSEO } from "@/hooks/useSEO";

export default function PrivacyPolicy() {
  useSEO({
    title: "Privacy Policy | hyperr",
    description: "How hyperr collects, uses, and protects your personal data, including session recording and GDPR/CCPA rights.",
  });
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-card rounded-2xl border p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <HyperrLogo size="md" />
            <h1 className="font-display font-bold text-2xl">Privacy Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">Last updated: July 6, 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="font-semibold text-base mb-2">1. Data We Collect</h2>
              <p className="text-muted-foreground">We collect the following categories of personal data:</p>
              <p className="font-medium text-foreground mt-3">Account Data</p>
              <p className="text-muted-foreground mt-1">When you register, we collect your name, email address, and authentication credentials (stored as a hashed password). If you sign up with Google OAuth, we receive your name and email from Google.</p>
              <p className="font-medium text-foreground mt-3">Profile Data</p>
              <p className="text-muted-foreground mt-1">Depending on whether you set up a creator or business profile, we collect the information you provide, such as display name, bio, niche or category, location, avatar/logo images, website, base rate, collaboration preferences, portfolio entries, listings, and proposal templates.</p>
              <p className="font-medium text-foreground mt-3">Social Media Data</p>
              <p className="text-muted-foreground mt-1">When you connect a social media account (e.g., Instagram, TikTok, YouTube, Twitter/X) for verification, we retrieve your handle or username and your follower/subscriber count. We use this solely to verify your metrics, assign a creator tier, and display verified status to other users. We do not access your private messages, contacts, or post content. We do not post on your behalf without your explicit action.</p>
              <p className="font-medium text-foreground mt-3">Usage Data</p>
              <p className="text-muted-foreground mt-1">When you use the Service, we automatically collect information about your interactions, including pages viewed, features used, messages sent, proposals and offers submitted, device type, browser type, IP address, timestamps, and other log data. This helps us operate, secure, and improve the Service.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use your personal data to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Provide, operate, and maintain the Service, including account creation, profile display, listings, messaging, and proposals.</li>
                <li>Verify social media metrics and assign creator tiers.</li>
                <li>Match creators with businesses and facilitate communication between users.</li>
                <li>Send you notifications, updates, and support communications related to your account or Trades.</li>
                <li>Monitor for fraud, abuse, and violations of our <Link to="/terms" className="text-primary underline">Terms of Service</Link>.</li>
                <li>Analyze usage patterns to improve the Service's usability, performance, and features.</li>
                <li>Comply with applicable legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">3. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground">We use cookies and similar tracking technologies (e.g., web beacons, local storage) to authenticate your session, remember your preferences, and gather analytics about how the Service is used. Cookies are small data files stored on your device when you visit a website.</p>
              <p className="text-muted-foreground mt-2">For detailed information about the specific cookies we use, how long they persist, and how to manage or disable them, please review our <Link to="/cookie-policy" className="text-primary underline">Cookie Policy</Link>. You can also control cookies through your browser settings; however, disabling cookies may affect certain features of the Service, such as staying logged in.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">4. Session Recording and Analytics</h2>
              <p className="text-muted-foreground">We may use session recording and analytics technologies to record and replay user interactions on our website. These tools capture data such as mouse movements, clicks, scrolls, navigation paths, and page content as you interact with the Service. We use this information to improve usability, diagnose technical issues, and enhance our services.</p>
              <p className="text-muted-foreground mt-2">Session recordings and analytics data are not linked to your identity unless combined with account data you provide. For more information about the analytics tools and tracking technologies we use, see our <Link to="/cookie-policy" className="text-primary underline">Cookie Policy</Link>.</p>
              <p className="text-muted-foreground mt-2">If you are a resident of the European Economic Area (EEA) under the GDPR or a California resident under the CCPA, you have the right to opt out of session recording. To exercise this right, please <Link to="/contact" className="text-primary underline">contact us</Link> before using the Service and we will disable recording for your session. You may also block recording scripts via browser extensions or "Do Not Track" signals, which we respect.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">5. Third-Party Processors</h2>
              <p className="text-muted-foreground">We do not sell your personal data. We share your data with third-party service providers and processors only as necessary to operate the Service. These processors are bound by contractual obligations to protect your data and use it only on our behalf. Our current third-party processors include:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li><strong className="text-foreground">Hosting and infrastructure providers</strong> — for hosting the application and storing your data.</li>
                <li><strong className="text-foreground">Authentication providers</strong> (e.g., Google) — for social sign-in.</li>
                <li><strong className="text-foreground">Social media platforms</strong> (e.g., Instagram, TikTok, YouTube, Twitter/X) — for metric verification when you explicitly connect your account.</li>
                <li><strong className="text-foreground">Payment processors</strong> (e.g., Stripe) — for escrow and payment features, when applicable. Payment data is handled directly by the processor; hyperr does not store full card numbers.</li>
                <li><strong className="text-foreground">Email and notification providers</strong> — for delivering transactional and marketing emails.</li>
                <li><strong className="text-foreground">Analytics and session recording providers</strong> — for understanding usage and improving the Service.</li>
              </ul>
              <p className="text-muted-foreground mt-2">We may also disclose your data if required to do so by law, court order, or government regulation, or if we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">6. Public Profile Data</h2>
              <p className="text-muted-foreground">Information you choose to display on your public creator or business profile — such as your display name, bio, niche, verified follower counts, tier, avatar, location, portfolio, and listings — is visible to other users and visitors of the Service. You are responsible for the information you choose to make public. Be mindful not to share sensitive personal data in public fields.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">7. Data Retention</h2>
              <p className="text-muted-foreground">We retain your personal data for as long as your account is active. When you delete your account, we remove or anonymize your profile data, listings, proposals, messages, and other user-generated content within a reasonable period, typically within 30 days, except where retention is required by law, to resolve disputes, or to enforce our agreements. Social media tokens used for verification are disconnected immediately upon account deletion or when you disconnect a social account.</p>
              <p className="text-muted-foreground mt-2">Usage data and log data may be retained for a longer period for security, fraud prevention, and analytics purposes, in an anonymized or aggregated form where possible.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">8. Your Rights</h2>
              <p className="text-muted-foreground">Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li><strong className="text-foreground">Access</strong> — You may request a copy of the personal data we hold about you.</li>
                <li><strong className="text-foreground">Correction</strong> — You may request that we correct inaccurate or incomplete personal data. You can also update most profile information directly within the Service.</li>
                <li><strong className="text-foreground">Deletion</strong> — You may request that we delete your personal data. You can also delete your account at any time through the account settings, which triggers the deletion process described in Section 7.</li>
                <li><strong className="text-foreground">Restriction or Objection</strong> — You may request that we restrict the processing of your data or object to certain types of processing.</li>
                <li><strong className="text-foreground">Data Portability</strong> — You may request a machine-readable copy of the personal data you provided to us.</li>
                <li><strong className="text-foreground">Withdrawal of Consent</strong> — Where we process your data based on consent (e.g., social account connections, session recording), you may withdraw consent at any time without affecting the lawfulness of processing prior to withdrawal.</li>
              </ul>
              <p className="text-muted-foreground mt-2">To exercise any of these rights, please <Link to="/contact" className="text-primary underline">contact us</Link>. We will respond to your request within 30 days. We may need to verify your identity before acting on your request.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">9. GDPR Rights (European Economic Area)</h2>
              <p className="text-muted-foreground">If you are a resident of the European Economic Area (EEA), the United Kingdom, or Switzerland, you have rights under the General Data Protection Regulation (GDPR). The legal bases on which we process your data include: (a) your consent; (b) performance of a contract (providing the Service you requested); (c) compliance with legal obligations; and (d) our legitimate interests in operating and securing the Service.</p>
              <p className="text-muted-foreground mt-2">In addition to the rights listed in Section 8, you have the right to lodge a complaint with your local data protection authority. If you believe we have not complied with the GDPR, you may file a complaint with the supervisory authority in your jurisdiction.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">10. CCPA Rights (California Residents)</h2>
              <p className="text-muted-foreground">If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA). Under these laws, you have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Know what personal data we have collected about you, the categories of sources, the business purpose for collecting it, and the categories of third parties with whom we share it.</li>
                <li>Request deletion of your personal data.</li>
                <li>Opt out of the "sale" or "sharing" of your personal data. We do not sell your personal data, and we will not sell it in the future.</li>
                <li>Not be discriminated against for exercising your privacy rights.</li>
              </ul>
              <p className="text-muted-foreground mt-2">To exercise your CCPA rights, please <Link to="/contact" className="text-primary underline">contact us</Link>. We will verify your identity before processing your request and respond within the timeframes required by California law.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">11. Children Under 18</h2>
              <p className="text-muted-foreground">The Service is not directed to children under 18, and we do not knowingly collect personal data from anyone under 18. If you are under 18, you must not create an account or use the Service. If we learn that we have collected personal data from a user under 18, we will delete that data promptly. If you believe we have collected information from a child under 18, please <Link to="/contact" className="text-primary underline">contact us</Link> so we can take appropriate action.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">12. Data Security</h2>
              <p className="text-muted-foreground">We take reasonable technical, organizational, and administrative measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security. You are responsible for maintaining the security of your account credentials.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">13. International Data Transfers</h2>
              <p className="text-muted-foreground">Your personal data may be processed and stored in countries other than your own, including the United States. Where we transfer data from the EEA, UK, or Switzerland to a country that has not been deemed to provide an adequate level of data protection, we rely on appropriate safeguards such as Standard Contractual Clauses or other lawful transfer mechanisms.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">14. Governing Law</h2>
              <p className="text-muted-foreground">This Privacy Policy and any disputes arising out of or related to it shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions, regardless of your location.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">15. Changes to This Policy</h2>
              <p className="text-muted-foreground">We may update this Privacy Policy from time to time. We will post the updated policy on this page and update the "Last updated" date above. If we make material changes, we will notify you through the Service or by email. Your continued use of the Service after the effective date of any revised policy constitutes your acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">16. Contact</h2>
              <p className="text-muted-foreground">If you have any questions, requests, or concerns about this Privacy Policy or your personal data, please <Link to="/contact" className="text-primary underline">contact us</Link>. We are committed to addressing your inquiries promptly and transparently.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}