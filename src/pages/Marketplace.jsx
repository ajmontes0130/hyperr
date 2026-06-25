import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ListingCard from "@/components/listings/ListingCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Package } from "lucide-react";

const categories = ["All", "Restaurant & Food", "Retail & Fashion", "Health & Beauty", "Tech & Software", "Travel & Hospitality", "Fitness & Wellness", "Entertainment", "Professional Services", "Education", "Other"];
const promoTypes = ["All", "Instagram Post", "Instagram Reel", "TikTok Video", "YouTube Video", "Blog Post", "Podcast Mention", "Twitter/X Post", "Newsletter Feature", "Event Appearance", "Other"];
const offeringTypes = ["All", "Product", "Service", "Experience"];
const valueRanges = [
  { label: "Any value", value: "all" },
  { label: "Under $50", value: "0-50" },
  { label: "$50 – $200", value: "50-200" },
  { label: "$200 – $500", value: "200-500" },
  { label: "$500+", value: "500-999999" },
];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [promoType, setPromoType] = useState("All");

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Listing.filter({ status: "active" }, "-created_date");
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = listings.filter((l) => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.offering_details?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || l.category === category;
    const matchPromo = promoType === "All" || (l.wanted_promotion_type && l.wanted_promotion_type.includes(promoType));
    return matchSearch && matchCat && matchPromo;
  });

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Trade Your Offerings for{" "}
          <span className="text-primary">Promotion</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Connect with creators and businesses. Offer products and services in exchange for content and exposure.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={promoType} onValueChange={setPromoType}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Promotion type" />
          </SelectTrigger>
          <SelectContent>
            {promoTypes.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">No listings found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}