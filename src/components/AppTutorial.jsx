import React, { useState } from "react";
import { X, ArrowRight, ArrowLeft, Home, Compass, Search, Heart, MessageCircle, Handshake, DollarSign, Sparkles, Users, PlusCircle, LayoutGrid, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const creatorSlides = [
  {
    icon: Home,
    label: "Home",
    color: "#2DD4FF",
    title: "Your Dashboard",
    desc: "A quick snapshot of your activity — active trades, completed collabs, your tier progress, and brand listings matched to your reach.",
  },
  {
    icon: Compass,
    label: "Explore",
    color: "#A78BFA",
    title: "Explore",
    desc: "Discover trending brands, new opportunities, and featured listings curated just for your niche and audience size.",
  },
  {
    icon: Search,
    label: "Marketplace",
    color: "#34D399",
    title: "Marketplace",
    desc: "Browse all active brand listings offering products, services, or experiences in exchange for your content. Find the perfect fit and send a trade proposal.",
  },
  {
    icon: Heart,
    label: "Saved",
    color: "#FF4D6D",
    title: "Saved Creators",
    desc: "Bookmarks for creators you want to connect with later. Keep tabs on your favourite collaborators.",
  },
  {
    icon: MessageCircle,
    label: "Messages",
    color: "#FBBF3D",
    title: "Messages",
    desc: "Direct messages with brands and collaborators. Keep all your collab conversations in one place.",
  },
  {
    icon: Handshake,
    label: "Barter Trades",
    color: "#2DD4FF",
    title: "Barter Trades",
    desc: "Manage every barter trade proposal — sent and received. Track status from pending all the way through to completed.",
  },
  {
    icon: DollarSign,
    label: "Cash Offers",
    color: "#34D399",
    title: "Cash Offers",
    desc: "Brands can send you direct paid offers here. Review, accept, and fulfill paid sponsorships with escrow-protected payments.",
  },
  {
    icon: Sparkles,
    label: "Creator Profile",
    color: "#A78BFA",
    title: "Your Creator Profile",
    desc: "Your public profile that brands see. Add your bio, niche, social handles, follower counts, and collab portfolio to attract the best offers.",
  },
];

const businessSlides = [
  {
    icon: Home,
    label: "Home",
    color: "#2DD4FF",
    title: "Your Dashboard",
    desc: "An overview of your account — active trade proposals, completed collabs, and listings you currently have running.",
  },
  {
    icon: Users,
    label: "Creators",
    color: "#A78BFA",
    title: "Creator Directory",
    desc: "Browse and filter creators by niche, tier, follower count, and location. Save your favourites and reach out directly.",
  },
  {
    icon: PlusCircle,
    label: "Post Listing",
    color: "#34D399",
    title: "Post a Listing",
    desc: "Create a new trade listing — describe your product, service, or experience and specify the type of content promotion you want in return.",
  },
  {
    icon: LayoutGrid,
    label: "My Listings",
    color: "#FBBF3D",
    title: "My Listings",
    desc: "Manage all your active, paused, and completed listings. Edit details, pause, or close listings at any time.",
  },
  {
    icon: MessageCircle,
    label: "Messages",
    color: "#FF4D6D",
    title: "Messages",
    desc: "Direct messages with creators. Discuss collab details, timelines, and expectations before committing.",
  },
  {
    icon: Handshake,
    label: "Barter Trades",
    color: "#2DD4FF",
    title: "Barter Trades",
    desc: "Review trade proposals from creators, accept the ones that fit, and track every barter from start to completion.",
  },
  {
    icon: DollarSign,
    label: "Cash Offers",
    color: "#34D399",
    title: "Cash Offers",
    desc: "Send paid sponsorship offers directly to creators. Funds are held in escrow and released only after you confirm delivery.",
  },
  {
    icon: FileText,
    label: "Templates",
    color: "#A78BFA",
    title: "Proposal Templates",
    desc: "Save reusable proposal templates so you can quickly reach out to multiple creators without rewriting the same message.",
  },
  {
    icon: User,
    label: "Business Profile",
    color: "#FBBF3D",
    title: "Business Profile",
    desc: "Your public-facing brand page. Add your logo, description, website, and social handles so creators know who they're working with.",
  },
];

export default function AppTutorial({ accountType, onClose }) {
  const [step, setStep] = useState(0);
  const slides = accountType === "business" ? businessSlides : creatorSlides;
  const current = slides[step];
  const isLast = step === slides.length - 1;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: "90vh" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center pt-5 pb-1 px-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                background: i === step ? current.color : "#25303F",
                width: i === step ? 24 : 8,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 pt-6 text-center">
          {/* Icon circle */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `${current.color}18`, border: `1.5px solid ${current.color}40` }}
          >
            <Icon className="w-9 h-9" style={{ color: current.color }} />
          </div>

          {/* Step label */}
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: current.color, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {current.label}
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-3 leading-tight">
            {current.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {current.desc}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 px-8 pb-8">
          {step > 0 ? (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Skip tour
            </Button>
          )}

          <Button
            className="flex-1"
            style={{ background: current.color, color: "#06303B" }}
            onClick={() => (isLast ? onClose() : setStep(step + 1))}
          >
            {isLast ? "Let's go! 🚀" : "Next"}
            {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}