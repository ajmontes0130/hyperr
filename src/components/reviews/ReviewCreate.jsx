import React, { useState, useEffect } from "react";
import { Loader2, Star, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { updateBusinessStats } from "@/api/reviews.api";

export default function ReviewCreate({ user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Business.list("-created_date");
      setBusinesses(data);
    } catch (error) {
      console.error("Load error:", error);
      toast({ title: "Error loading businesses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({ title: "Max 5 images", variant: "destructive" });
      return;
    }

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrls((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    }

    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !rating) {
      toast({ title: "Select business and rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        business_id: selectedBusiness,
        creator_id: user.id,
        creator_name: user.name || "Anonymous",
        rating: parseInt(rating),
        text: text || null,
        images: imageUrls,
        helpful_count: 0,
        unhelpful_count: 0,
        created_date: new Date().toISOString(),
      });

      await updateBusinessStats(selectedBusiness);

      toast({ title: "✓ Review posted!", description: "Thank you for your review" });
      setTimeout(() => navigate("/reviews/feed"), 1000);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Write a Review</h1>
        <p className="text-muted-foreground">Share your experience with others</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Select Business</label>
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg mb-2"
          />
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background"
          >
            <option value="">Choose a business</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className="p-2 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    num <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{rating}/5 stars</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Your Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your experience... (optional)"
            rows={5}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Photos (Optional)</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold">Upload images</p>
              <p className="text-xs text-muted-foreground">Max 5 images</p>
            </label>
          </div>

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedBusiness}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitting ? "Posting..." : "Post Review"}
        </button>
      </form>
    </div>
  );
}
