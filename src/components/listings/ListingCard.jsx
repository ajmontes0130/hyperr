import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, ImageOff } from "lucide-react";

const typeColors = {
  Product: "bg-[#0E2A22] text-[#34D399] border-[#34D399]/30",
  Service: "bg-[#0E2A33] text-[#2DD4FF] border-[#2DD4FF]/30",
  Experience: "bg-[#2E2410] text-[#FBBF3D] border-[#FBBF3D]/30",
};

export default function ListingCard({ listing }) {
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:bg-secondary hover:border-[#34425A] hover:shadow-lg hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
    >
      {listing.image_url ? (
        <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${typeColors[listing.offering_type] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
              {listing.offering_type}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-5 py-2.5 border-b border-border/50 flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${typeColors[listing.offering_type] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
            {listing.offering_type}
          </span>
          <span className="text-xs text-muted-foreground/50 flex items-center gap-1 ml-auto">
            <ImageOff className="w-3 h-3" /> No photo
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {listing.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {listing.offering_details}
        </p>

        {listing.wanted_promotion_type && listing.wanted_promotion_type.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {listing.wanted_promotion_type.slice(0, 2).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs font-normal">
                {type}
              </Badge>
            ))}
            {listing.wanted_promotion_type.length > 2 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{listing.wanted_promotion_type.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {listing.location && (
              <>
                <MapPin className="w-3 h-3" />
                <span>{listing.location}</span>
              </>
            )}
            {!listing.location && <span>{listing.category}</span>}
          </div>
          {listing.estimated_value > 0 ? (
            <span className="text-xs font-semibold text-primary">
              ~${listing.estimated_value.toLocaleString()} value
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/60">Value TBD</span>
          )}
        </div>
      </div>
    </Link>
  );
}