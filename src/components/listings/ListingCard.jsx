import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";

const typeColors = {
  Product: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Service: "bg-blue-50 text-blue-700 border-blue-200",
  Experience: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ListingCard({ listing }) {
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group bg-white rounded-2xl border border-border/60 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">📦</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${typeColors[listing.offering_type] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
            {listing.offering_type}
          </span>
        </div>
      </div>

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
          {listing.estimated_value > 0 && (
            <span className="text-xs font-semibold text-primary">
              ~${listing.estimated_value}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}