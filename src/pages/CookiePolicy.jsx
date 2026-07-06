import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HyperrLogo from "@/components/HyperrLogo";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-card rounded-2xl border p-8">
          <div className="flex items-center gap-3 mb-6">
            <HyperrLogo size="md" />
            <h1 className="font-display font-bold text-2xl">Cookie Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Last updated: July 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="font-semibold text-base mb-2">1. What Are Cookies</h2>
              <p className="text-muted-foreground">Cookies are small text files stored on your device when you visit a website. They allow the site to remember your actions and preferences over a period of time, so you don't have to re-enter them every time you visit.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">2. How We Use Cookies</h2>
              <p className="text-muted-foreground">hyperr uses cookies for the following purposes:</p>
              <ul className="text-muted-foreground list-disc pl-5 mt-2 space-y-1">
                <li><strong className="text-foreground">Authentication:</strong> To keep you logged in and maintain your session securely.</li>
                <li><strong className="text-foreground">Analytics:</strong> To understand how visitors use our platform so we can improve it.</li>
                <li><strong className="text-foreground">Session Recording:</strong> We may record user interactions (mouse movements, clicks, scrolls, and page content) to diagnose issues and improve usability.</li>
                <li><strong className="text-foreground">Functionality:</strong> To remember your preferences and settings.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">3. Session Recording</h2>
              <p className="text-muted-foreground">We use session replay technology that captures your on-screen interactions. This data is used solely for product improvement and troubleshooting. It is not linked to your identity unless combined with account data you provide. If you are a resident of the European Economic Area (GDPR) or California (CCPA), you may opt out of session recording at any time by declining cookies via the consent banner shown on your first visit, or by contacting us.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground">We may use third-party services (such as analytics providers and authentication providers) that set their own cookies. These third parties have their own privacy and cookie policies, and we encourage you to review them.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">5. Managing Cookies</h2>
              <p className="text-muted-foreground">You can control and delete cookies through your browser settings. Disabling cookies may affect functionality — for example, you may not be able to stay logged in. You can also reset your consent choice by clearing your browser's local storage for this site.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">6. Changes to This Policy</h2>
              <p className="text-muted-foreground">We may update this Cookie Policy from time to time. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}