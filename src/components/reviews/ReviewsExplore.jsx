import React, { useState, useEffect } from "react";
import { Loader2, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function ReviewsExplore() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [search, category, businesses]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Business.list("-review_count");
      setBusinesses(data);
      const cats = [...new Set(data.map((b) => b.category))].sort();
      setCategories(cats);
    } catch (error) {
      console.error("Load error:", error);
      toast({ title: "Error loading businesses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    let result = businesses;
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query)
      );
    }
    if (category) {
      result = result.filter((b) => b.category === category);
    }
    setFiltered(result);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Explore Businesses</h1>
        <p className="text-muted-foreground">Discover restaurants, brands, and more</p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                category === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No businesses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((business) => (
            <button
              key={business.id}
              onClick={() => navigate(`/reviews/business/${business.id}`)}
              className="bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-md transition-all text-left"
            >
              <h3 className="font-display font-bold text-lg mb-1">{business.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{business.category}</p>
              {business.location && (
                <p className="text-xs text-muted-foreground mb-3">{business.location}</p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(business.avg_rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{business.avg_rating || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">{business.review_count || 0}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
