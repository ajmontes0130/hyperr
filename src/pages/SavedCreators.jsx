import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import LevelBadge from "@/components/creator/LevelBadge";

export default function SavedCreators() {
  const [savedList, setSavedList] = useState([]);
  const [creatorMap, setCreatorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(async (me) => {
      setUser(me);
      const saved = await base44.entities.SavedCreator.filter({ user_id: me.id });
      setSavedList(saved);
      const profiles = await base44.entities.CreatorProfile.list();
      const map = {};
      profiles.forEach((p) => { map[p.id] = p; });
      setCreatorMap(map);
    }).finally(() => setLoading(false));
  }, []);

  const remove = async (savedItem) => {
    await base44.entities.SavedCreator.delete(savedItem.id);
    setSavedList((prev) => prev.filter((s) => s.id !== savedItem.id));
    toast({ title: "Removed from saved" });
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight mb-1">
          Saved <span className="text-primary">Creators</span>
        </h1>
        <p className="text-muted-foreground">Creators you've bookmarked for later.</p>
      </div>

      {savedList.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">No saved creators yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Browse the Explore tab and save creators you like.</p>
          <Button onClick={() => navigate("/explore")}>Explore Creators</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedList.map((saved) => {
            const creator = creatorMap[saved.creator_profile_id];
            if (!creator) return null;
            return (
              <div key={saved.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  {creator.avatar_url ? (
                    <img src={creator.avatar_url} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{creator.display_name}</p>
                    {creator.location && <p className="text-xs text-muted-foreground truncate">{creator.location}</p>}
                    <div className="mt-1"><LevelBadge level={creator.creator_level} size="sm" /></div>
                  </div>
                </div>
                {creator.bio && <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{creator.bio}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs" onClick={() => navigate(`/creator/${creator.id}`)}>View Profile</Button>
                  <Button size="sm" className="rounded-lg text-xs gap-1" onClick={() => navigate(`/messages?with=${creator.id}&name=${encodeURIComponent(creator.display_name)}`)}>
                    <MessageCircle className="w-3.5 h-3.5" /> Message
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-lg px-2 text-muted-foreground hover:text-destructive" onClick={() => remove(saved)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}