"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, MapPin } from "lucide-react";
import { EquipmentCondition } from "@prisma/client";

interface EquipmentFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  search: string;
  category: string;
  condition: string;
  location: string;
  priceMin: string;
  priceMax: string;
}

const EQUIPMENT_CATEGORIES = [
  "Tractor",
  "Harvester",
  "Tiller",
  "Irrigation System",
  "Seeder",
  "Sprayer",
  "Plow",
  "Cultivator",
  "Other"
];

const EQUIPMENT_CONDITIONS: EquipmentCondition[] = ["NEW", "USED", "REFURBISHED"];

export function EquipmentFilters({ onFiltersChange, initialFilters }: EquipmentFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    condition: "",
    location: "",
    priceMin: "",
    priceMax: "",
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      category: "",
      condition: "",
      location: "",
      priceMin: "",
      priceMax: ""
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== "").length;

  return (
    <div className=" p-4 rounded-lg border shadow-sm space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search equipment..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {EQUIPMENT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Condition</label>
            <Select
              value={filters.condition}
              onValueChange={(value) => handleFilterChange("condition", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All conditions</SelectItem>
                {EQUIPMENT_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Enter location..."
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Price Range (₹)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min price"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                className="flex-1"
              />
              <span className="flex items-center text-gray-500">to</span>
              <Input
                type="number"
                placeholder="Max price"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters & Clear Button */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.search}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange("search", "")}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange("category", "")}
                />
              </Badge>
            )}
            {filters.condition && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Condition: {filters.condition}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange("condition", "")}
                />
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Location: {filters.location}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange("location", "")}
                />
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
