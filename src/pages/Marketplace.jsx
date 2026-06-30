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
import { Search, Loader2, Package, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PullToRefresh from "@/components/PullToRefresh";

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

import { Button } from "@/components/ui/button";

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [promoType, setPromoType] = useState("All");
  const [offeringType, setOfferingType] = useState("All");
  const [valueRange, setValueRange] = useState("all");

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await base44.entities.Listing.filter({ status: "active" }, "-created_date");
      setListings(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = listings.filter((l) => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.offering_details?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || l.category === category;
    const matchPromo = promoType === "All" || (l.wanted_promotion_type && l.wanted_promotion_type.includes(promoType));
    const matchType = offeringType === "All" || l.offering_type === offeringType;
    const matchValue = valueRange === "all" || (() => {
      const [min, max] = valueRange.split("-").map(Number);
      const v = l.estimated_value || 0;
      return v >= min && v <= max;
    })();
    return matchSearch && matchCat && matchPromo && matchType && matchValue;
  });

  return (
    <PullToRefresh onRefresh={loadListings}>
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Trade Your Offerings for{" "}
          <span className="text-primary">Promotion</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-5">
          Connect with creators and businesses. Offer products and services in exchange for content and exposure.
        </p>
        <Link to="/create-listing">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" /> Post a Listing
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border p-4 mb-8 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-1">Offering Type</p>
            <Select value={offeringType} onValueChange={setOfferingType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {offeringTypes.map((t) => <SelectItem key={t} value={t}>{t === "All" ? "All types" : t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-1">Category</p>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c === "All" ? "All categories" : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-1">Promotion Wanted</p>
            <Select value={promoType} onValueChange={setPromoType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {promoTypes.map((p) => <SelectItem key={p} value={p}>{p === "All" ? "Any type" : p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-1">Offering Value</p>
            <Select value={valueRange} onValueChange={setValueRange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {valueRanges.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">Something went wrong loading listings.</p>
          <button onClick={loadListings} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">No listings found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {listings.length === 0 ? "No listings yet — be the first to post one." : "Try adjusting your filters."}
          </p>
          {listings.length === 0 && (
            <Link to="/create-listing">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
                <PlusCircle className="w-4 h-4" /> Post a Listing
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}