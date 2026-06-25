import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="bg-white rounded-2xl border p-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="https://media.base44.com/images/public/6a3c51b5316c274a51ac7590/3c7980363_image.png" alt="Hyper" className="h-8 w-auto" />
            <h1 className="font-display font-bold text-2xl">Privacy Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Last updated: June 2025 · This policy is a placeholder and will be replaced with the full legal document before launch.</p>

          <div className="space-y-6 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="font-semibold text-base mb-2">1. Information We Collect</h2>
              <p className="text-muted-foreground">We collect information you provide directly (name, email, profile details), information from social platforms you connect, and usage data generated while using Hyper.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use your information to operate the platform, match creators with businesses, send notifications about your account, and improve our services.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">3. Information Sharing</h2>
              <p className="text-muted-foreground">We do not sell your personal data. Profile information you choose to make public is visible to other users. We may share data with service providers who help us operate the platform.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">4. Social Account Data</h2>
              <p className="text-muted-foreground">When you connect a social account for verification, we access only the follower/subscriber counts needed to verify your tier. We do not post on your behalf without explicit action.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">5. Data Retention</h2>
              <p className="text-muted-foreground">We retain your data while your account is active and for a reasonable period after deletion as required by law or legitimate business purposes.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">6. Your Rights</h2>
              <p className="text-muted-foreground">You may request access to, correction of, or deletion of your personal data by contacting us. We will respond within 30 days.</p>
            </section>
            <section>
              <h2 className="font-semibold text-base mb-2">7. Cookies</h2>
              <p className="text-muted-foreground">We use cookies for authentication and analytics. You can control cookies through your browser settings, though this may affect platform functionality.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}