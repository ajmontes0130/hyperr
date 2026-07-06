import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

// Curated list of major US cities for datalist autocomplete.
const US_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Washington, DC",
  "Boston, MA", "El Paso, TX", "Nashville, TN", "Detroit, MI", "Oklahoma City, OK",
  "Portland, OR", "Las Vegas, NV", "Memphis, TN", "Louisville, KY", "Baltimore, MD",
  "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA", "Sacramento, CA",
  "Kansas City, MO", "Mesa, AZ", "Atlanta, GA", "Omaha, NE", "Colorado Springs, CO",
  "Raleigh, NC", "Miami, FL", "Long Beach, CA", "Virginia Beach, VA", "Oakland, CA",
  "Minneapolis, MN", "Tulsa, OK", "Arlington, TX", "Tampa, FL", "New Orleans, LA",
  "Wichita, KS", "Cleveland, OH", "Bakersfield, CA", "Aurora, CO", "Anaheim, CA",
  "Honolulu, HI", "Santa Ana, CA", "Riverside, CA", "Corpus Christi, TX", "Lexington, KY",
  "Stockton, CA", "St. Louis, MO", "Saint Paul, MN", "Henderson, NV", "Pittsburgh, PA",
  "Cincinnati, OH", "St. Petersburg, FL", "Anchorage, AK", "Greensboro, NC", "Plano, TX",
  "Lincoln, NE", "Orlando, FL", "Irvine, CA", "Newark, NJ", "Toledo, OH",
  "Jersey City, NJ", "Chula Vista, CA", "Durham, NC", "Fort Wayne, IN", "St. Petersburg, FL",
  "Laredo, TX", "Buffalo, NY", "Madison, WI", "Lubbock, TX", "Chandler, AZ",
  "Scottsdale, AZ", "Reno, NV", "Glendale, AZ", "Norfolk, VA", "Winston-Salem, NC",
  "North Las Vegas, NV", "Gilbert, AZ", "Chesapeake, VA", "Garland, TX", "Irving, TX",
  "Boise, ID", "Birmingham, AL", "Burlington, VT", "Charleston, SC", "Des Moines, IA",
  "Hartford, CT", "Salt Lake City, UT", "Boise, ID", "Providence, RI", "Richmond, VA",
];

function titleCase(str) {
  return str
    .split(",")
    .map((part) =>
      part
        .trim()
        .split(" ")
        .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(" ")
    )
    .join(", ");
}

export default function LocationInput({ value, onChange, placeholder = "City, State" }) {
  const listId = useMemo(() => "loc-" + Math.random().toString(36).slice(2, 9), []);

  const handleChange = (e) => {
    onChange(titleCase(e.target.value));
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        list={listId}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10"
      />
      <datalist id={listId}>
        {US_CITIES.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </div>
  );
}