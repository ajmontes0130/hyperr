import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HyperrLogo from "@/components/HyperrLogo";
import { useSEO } from "@/hooks/useSEO";

export default function TermsOfService() {
  useSEO({
    title: "Terms of Service | hyperr",
    description: "The terms and conditions for using hyperr, the barter marketplace for creators and businesses.",
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
            <h1 className="font-display font-bold text-2xl">Terms of Service</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">Last updated: July 6, 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="font-semibold text-base mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">By creating an account, browsing, or otherwise using the hyperr platform (the "Service"), you agree to be bound by these Terms of Service ("Terms") and our <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>. If you do not agree to these Terms, you must not access or use the Service. These Terms constitute a legally binding agreement between you and hyperr.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">2. Eligibility</h2>
              <p className="text-muted-foreground">You must be at least 18 years of age to create an account or use the Service. By registering, you represent and warrant that you are at least 18 years old, have the legal capacity to enter into these Terms, and are not barred from doing so under applicable law. If hyperr learns that a user is under 18, the account will be terminated immediately.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">3. Account Responsibilities</h2>
              <p className="text-muted-foreground">You are responsible for maintaining the confidentiality and security of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use or security breach. You must provide accurate, complete, and current information when creating your account and profile, and keep it up to date. You may create only one account per person or business entity. You are solely responsible for all content you post and all communications you send through the Service.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">4. The hyperr Marketplace — Role of the Platform</h2>
              <p className="text-muted-foreground">hyperr is a marketplace that facilitates connections between businesses and content creators for barter-based and paid collaborations. You acknowledge and agree that:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>hyperr is <strong className="text-foreground">not a party</strong> to any agreement, arrangement, or transaction entered into between users (a "Trade") and has no responsibility or liability for any Trade or the performance of any party to a Trade.</li>
                <li>hyperr does not guarantee the quality, safety, legality, or accuracy of any listing, profile, deliverable, offer, or communication made through the Service.</li>
                <li>All Trades are solely between the participating users, who are responsible for negotiating terms, fulfilling obligations, and resolving any disputes between them.</li>
                <li>hyperr may, but is not obligated to, provide messaging, proposal, offer, and escrow-related tools to assist with communication and coordination, but the use and outcome of those tools is at the users' own risk.</li>
              </ul>
              <p className="text-muted-foreground mt-2">You use the Service at your own risk. You should exercise caution and conduct your own due diligence before entering into any Trade.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">5. Prohibited Conduct</h2>
              <p className="text-muted-foreground">You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Posting false, misleading, deceptive, or fraudulent content, including inflated or fabricated follower or subscriber counts.</li>
                <li>Impersonating another person or entity or misrepresenting your affiliation with a person or entity.</li>
                <li>Using the Service for any illegal purpose or in violation of any applicable law or regulation.</li>
                <li>Harassing, threatening, or defaming any other user.</li>
                <li>Attempting to gain unauthorized access to the Service, its systems, or another user's data.</li>
                <li>Using bots, scrapers, or automated tools to access or extract data from the Service.</li>
                <li>Posting content that infringes the intellectual property, privacy, or other rights of any third party.</li>
                <li>Soliciting payments outside the platform to circumvent escrow or other features, when applicable.</li>
                <li>Re-selling, leasing, or sublicensing access to the Service.</li>
              </ul>
              <p className="text-muted-foreground mt-2">Violation of these prohibitions may result in immediate suspension or termination of your account and may expose you to legal liability.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">6. Verified-Metrics Policy</h2>
              <p className="text-muted-foreground">hyperr allows creators to verify social media follower and subscriber counts by connecting their social accounts through our verification process. Verified metrics are used to assign a creator tier and to help businesses evaluate potential collaborators.</p>
              <p className="text-muted-foreground mt-2">You agree that:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>You will not manipulate, inflate, or misrepresent your social metrics at any time.</li>
                <li>Manually entered follower counts that have not been verified through our process are marked as "Unverified" and do not contribute to your tier or displayed reach.</li>
                <li>You will not buy, rent, or otherwise acquire fake followers or engagement to increase your perceived metrics.</li>
                <li>hyperr reserves the right to periodically re-verify metrics and to suspend or terminate accounts found to have misrepresented or manipulated their metrics.</li>
                <li>hyperr is not liable for any decisions made by businesses based on creator metrics, whether verified or unverified.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">7. Fees</h2>
              <p className="text-muted-foreground">The Service is currently free to use. hyperr does not charge any fees for creating an account, posting listings, sending proposals, or using the messaging and collaboration tools. We reserve the right to introduce fees, subscriptions, or commission-based pricing in the future. Any such changes will be communicated in advance through the Service or via email, and will apply only prospectively from the date announced.</p>
              <p className="text-muted-foreground mt-2">Where escrow or payment features are used, applicable payment processing fees charged by third-party payment processors (e.g., Stripe) may apply and will be disclosed at the time of the transaction.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">8. Dispute Process</h2>
              <p className="text-muted-foreground">Because all Trades are between users and hyperr is not a party to any Trade, users are responsible for resolving disputes between themselves. hyperr recommends the following process:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Attempt to resolve the dispute directly with the other party through the messaging tools or other communication channels.</li>
                <li>If a resolution cannot be reached, document the Trade terms and communications and seek mediation through an independent third party.</li>
                <li>If a payment was placed in escrow, follow the release or dispute process provided within the applicable payment feature. hyperr may, at its sole discretion, assist with escrow disputes but does not adjudicate the underlying Trade.</li>
              </ul>
              <p className="text-muted-foreground mt-2">hyperr is not responsible for losses arising from any Trade or dispute and will not act as an arbitrator or mediator except as expressly stated in a specific escrow feature's terms.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">9. Intellectual Property</h2>
              <p className="text-muted-foreground">The Service, including its branding, logo, design, text, and software, is owned by hyperr and is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from the Service without our prior written consent. Content you post remains your property; by posting it on the Service, you grant hyperr a non-exclusive, royalty-free, worldwide license to display, reproduce, and distribute that content for the purpose of operating and promoting the Service.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">10. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. hyperr does not warrant that the Service will be uninterrupted, error-free, secure, or that any listing, profile, offer, or Trade will result in a successful outcome.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">11. Limitation of Liability</h2>
              <p className="text-muted-foreground">To the maximum extent permitted by applicable law, hyperr, its officers, directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of or related to your use of the Service or any Trade entered into through the Service, whether based on warranty, contract, tort (including negligence), or any other legal theory, even if hyperr has been advised of the possibility of such damages.</p>
              <p className="text-muted-foreground mt-2">hyperr's aggregate liability for any claim arising out of or related to the Service shall not exceed the greater of (a) the amounts you have paid to hyperr in the twelve (12) months preceding the claim, or (b) fifty U.S. dollars ($50). You acknowledge that the limitations of liability set forth in this section are a fundamental basis of the bargain between you and hyperr.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">12. Indemnification</h2>
              <p className="text-muted-foreground">You agree to indemnify, defend, and hold harmless hyperr, its officers, directors, employees, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any applicable law or the rights of any third party; or (d) any Trade or dispute involving you. hyperr reserves the right to assume the exclusive defense of any matter for which it is entitled to indemnification, in which case you will cooperate with hyperr in asserting any available defenses.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">13. Termination</h2>
              <p className="text-muted-foreground">You may terminate your account at any time by using the account deletion feature within the Service or by contacting us. hyperr may suspend or terminate your account at any time, with or without cause and without prior notice, if it believes you have violated these Terms or any applicable law. Upon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination (including Sections 4, 9, 10, 11, 12, and 14) shall remain in effect.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">14. Governing Law and Dispute Resolution</h2>
              <p className="text-muted-foreground">These Terms and any dispute arising out of or related to them or to the Service shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. You and hyperr agree to submit to the personal and exclusive jurisdiction of the state and federal courts located in Delaware for any dispute not subject to informal resolution under Section 8, except that either party may bring a small claims action in the jurisdiction where you reside.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">15. Changes to These Terms</h2>
              <p className="text-muted-foreground">We may modify these Terms from time to time. We will post the updated Terms on this page and update the "Last updated" date above. If the changes are material, we will also notify you through the Service or by email. Your continued use of the Service after the effective date of any revised Terms constitutes your acceptance of the updated Terms. If you do not agree to the revised Terms, you must stop using the Service and may terminate your account.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">16. Contact</h2>
              <p className="text-muted-foreground">If you have any questions about these Terms, please <Link to="/contact" className="text-primary underline">contact us</Link>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}