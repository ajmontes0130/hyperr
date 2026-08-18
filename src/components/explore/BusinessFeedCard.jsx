import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, MapPin, Building2, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessFeedCard({ business, saved, onToggleSave, onMessage }) {
  const navigate = useNavigate();

  const name = business.business_name || "Unnamed Business";
  const logo = business.logo_url;
  const description = business.description;
  const category = business.category;
  const location = business.location;
  const website = business.website;

  return (
    <div className="bg-card rounded-3xl border shadow-lg shadow-black/30 overflow-hidden snap-start">
      {/* Hero / logo */}
      <div className="relative h-48 bg-gradient-to-br from-[#0E2A33] via-[#121823] to-[#1B2330] flex items-center justify-center">
        {logo ? (
          <img src={logo} alt={name} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-border shadow-lg" />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center ring-4 ring-border shadow-lg">
            <Building2 className="w-12 h-12 text-primary/50" />
          </div>
        )}
        {category && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="rounded-full bg-[#0E2A33] text-[#2DD4FF] border border-[#2DD4FF]/30">
              {category}
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display font-bold text-2xl">{name}</h2>
        </div>

        {location && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" /> {location}
          </div>
        )}

        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{description}</p>
        )}

        {website && (
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-5"
          >
            <Globe className="w-3.5 h-3.5" /> {website.replace(/^https?:\/\//, "")}
          </a>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className={`flex-1 rounded-xl gap-2 ${saved.has(business.id) ? "border-[#FF4D6D]/40 text-[#FF4D6D] bg-[#2E121A] hover:bg-[#3a1525]" : ""}`}
            onClick={() => onToggleSave(business)}
          >
            <Heart className={`w-4 h-4 ${saved.has(business.id) ? "fill-rose-500" : ""}`} />
            {saved.has(business.id) ? "Saved" : "Save"}
          </Button>
          <Button className="flex-1 rounded-xl gap-2" onClick={() => onMessage(business)}>
            <MessageCircle className="w-4 h-4" /> Message
          </Button>
          <Button variant="ghost" className="rounded-xl px-4" onClick={() => navigate(`/listing?business=${business.id}`)}>
            View
          </Button>
        </div>
      </div>
    </div>
  );
}