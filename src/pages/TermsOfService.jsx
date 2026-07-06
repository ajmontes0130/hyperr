import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HyperrLogo from "@/components/HyperrLogo";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-white rounded-2xl border p-8">
          <div className="flex items-center gap-3 mb-6">
            <HyperrLogo size="md" />
            <h1 className="font-display font-bold text-2xl">Terms of Service</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Last updated: June 2025 · These terms are a placeholder and will be replaced with the full legal document before launch.</p>

          <div className="space-y-6 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="font-semibold text-base mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">By creating an account on hyperr, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the platform.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">2. Description of Service</h2>
              <p className="text-muted-foreground">hyperr is a marketplace platform connecting content creators and businesses for barter and paid collaboration arrangements. We facilitate introductions and transactions but are not a party to any collaboration agreement.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">3. User Accounts</h2>
              <p className="text-muted-foreground">You must be at least 18 years old to use hyperr. You are responsible for maintaining the security of your account and all activity that occurs under it.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">4. Content & Conduct</h2>
              <p className="text-muted-foreground">You agree not to post false, misleading, or fraudulent information. Follower counts and social metrics must be accurate to the best of your knowledge.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">5. Disputes Between Users</h2>
              <p className="text-muted-foreground">hyperr is not responsible for disputes arising between creators and businesses. We recommend documenting all collaboration agreements in writing.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">6. Termination</h2>
              <p className="text-muted-foreground">We reserve the right to suspend or terminate accounts that violate these terms at our sole discretion.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">7. Changes to Terms</h2>
              <p className="text-muted-foreground">We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}