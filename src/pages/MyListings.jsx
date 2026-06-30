import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Loader2, Package, Trash2, Pause, Play, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EditListingModal from "@/components/listings/EditListingModal";

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const data = await base44.entities.Listing.filter({ created_by_id: me.id }, "-created_date");
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (listing) => {
    const newStatus = listing.status === "active" ? "paused" : "active";
    await base44.entities.Listing.update(listing.id, { status: newStatus });
    toast({ title: `Listing ${newStatus}` });
    loadData();
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    await base44.entities.Listing.delete(id);
    toast({ title: "Listing deleted" });
    loadData();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl">My Listings</h1>
          <p className="text-muted-foreground mt-1">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/create-listing">
          <Button className="rounded-xl"><PlusCircle className="w-4 h-4 mr-2" /> New Listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border">
          <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">No listings yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Create your first listing to start trading.</p>
          <Link to="/create-listing">
            <Button className="rounded-xl"><PlusCircle className="w-4 h-4 mr-2" /> Create Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-card rounded-2xl border p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-secondary transition-colors">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0 overflow-hidden">
                {listing.image_url ? (
                  <img src={listing.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/listing/${listing.id}`} className="font-display font-semibold hover:text-primary transition-colors">
                  {listing.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant={listing.status === "active" ? "default" : "secondary"} className="capitalize text-xs">
                    {listing.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{listing.category}</span>
                  {listing.estimated_value > 0 && (
                    <span className="text-xs text-muted-foreground">~${Number(listing.estimated_value).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setEditingListing(listing)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toggleStatus(listing)}>
                  {listing.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg text-destructive hover:bg-destructive/10" onClick={() => deleteListing(listing.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <EditListingModal
        listing={editingListing}
        open={!!editingListing}
        onClose={() => setEditingListing(null)}
        onSaved={loadData}
      />
    </div>
  );
}