import React from "react";
import { Star } from "lucide-react";

export default function StarRating({ value, onChange, readonly = false, size = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}
        >
          <Star
            className={`w-${size} h-${size} ${star <= value ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-100"}`}
          />
        </button>
      ))}
    </div>
  );
}