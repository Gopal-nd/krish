'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Search, Filter, RefreshCw, Download, TrendingUp, TrendingDown, ArrowUpDown, Loader2, AlertCircle, MapPin, ShoppingCart, BarChart3 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { CommodityRecord, Filters, IndiaApiResponse } from '@/types/types';
import { safeFetch } from '@/lib/fetcher';
import HistoricalChart from './HistoricalChart';

const SAMPLE_FILTERS = {
  states: [
    "Karnataka", "Punjab", "Maharashtra", "Uttar Pradesh", "Gujarat",
    "Rajasthan", "Madhya Pradesh", "Tamil Nadu", "Andhra Pradesh", "Haryana"
  ],
  commodities: [
    "Onion", "Wheat", "Rice", "Tomato", "Potato", "Maize", "Cotton", "Sugarcane",
    "Soybean", "Groundnut", "Chilli", "Turmeric", "Coriander", "Cumin", "Mustard"
  ],
  markets: [
    "Bangalore", "Mysore", "Hubli", "Belgaum", "Ludhiana", "Amritsar", "Jalandhar",
    "Mumbai", "Pune", "Nagpur", "Delhi", "Agra", "Kanpur", "Lucknow"
  ]
};

const IndiaMarketTable: React.FC = () => {
  const [data, setData] = useState<CommodityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'modal_price' | 'commodity' | 'state'>('commodity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [historicalData, setHistoricalData] = useState<Array<{ date: string; price: number; currency: string }>>([]);
  const [commodityInfo, setCommodityInfo] = useState<any>(null);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMarketData = useCallback(async (searchFilters: Filters = {}, includeHistory: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: '10', offset: '0' });
      if (searchFilters.state) params.append('state', searchFilters.state);
      if (searchFilters.commodity) params.append('commodity', searchFilters.commodity);
      if (searchFilters.market) params.append('market', searchFilters.market);
      if (includeHistory) params.append('history', 'true');

      const response = await safeFetch<IndiaApiResponse>(`/api/india-market?${params.toString()}`);
      if (!response.records || response.records.length === 0) {
        setData([]);
        setHistoricalData([]);
        setCommodityInfo(null);
        setError('No data found for the selected filters. Try different criteria.');
        return;
      }
      
      setData(response.records);
      setHistoricalData(response.historicalData || []);
      setCommodityInfo(response.commodityInfo);
      setCurrentPrice(response.currentPrice);
      setSelectedCommodity(searchFilters.commodity || '');
      
      toast({ title: 'Data Updated', description: `Found ${response.records.length} commodity records` });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
      setData([]);
      setHistoricalData([]);
      setCommodityInfo(null);
      setCurrentPrice(null);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const filteredData = data
    .filter(item => {
      const matchesSearch = debouncedSearchQuery === '' ||
        item.commodity.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.market.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.state.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesFilters = (!filters.state || item.state === filters.state) &&
        (!filters.commodity || item.commodity === filters.commodity) &&
        (!filters.market || item.market === filters.market);
      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortBy];
      let bValue: string | number = b[sortBy];
      if (sortBy === 'modal_price') {
        aValue = parseFloat(a.modal_price) || 0;
        bValue = parseFloat(b.modal_price) || 0;
      }
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') delete newFilters[key];
    else newFilters[key] = value;
    setFilters(newFilters);
    
    // If commodity is selected, fetch data with history and current prices
    if (key === 'commodity' && value !== 'all' && value !== '') {
      fetchMarketData(newFilters, true);
    }
  };

  // Enhanced filter handler that triggers data fetch for any filter change
  const handleFilterApply = () => {
    if (filters.commodity && filters.commodity !== 'all') {
      fetchMarketData(filters, true);
    } else {
      fetchMarketData(filters, false);
    }
  };

  const handleSort = (column: 'modal_price' | 'commodity' | 'state') => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast({ title: 'No Data', description: 'No data to export', variant: 'destructive' });
      return;
    }
    const headers = ['State', 'Market', 'Commodity', 'Modal Price (₹)', 'Min Price (₹)', 'Max Price (₹)', 'Arrival Date'];
    const csvData = filteredData.map(item => [
      item.state,
      item.market,
      item.commodity,
      item.modal_price,
      item.min_price,
      item.max_price,
      item.arrival_date,
    ]);
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `india-commodity-prices-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Export Complete', description: `Exported ${filteredData.length} records to CSV` });
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 'N/A' : `₹${numPrice.toLocaleString('en-IN')}`;
  };

  const getPriceTrend = (min: string, max: string, modal: string) => {
    const minPrice = parseFloat(min);
    const maxPrice = parseFloat(max);
    const modalPrice = parseFloat(modal);
    if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(modalPrice)) return null;
    const range = maxPrice - minPrice;
    const position = modalPrice - minPrice;
    if (position < range * 0.33) return <TrendingDown className="w-4 h-4 text-green-600" />;
    if (position > range * 0.67) return <TrendingUp className="w-4 h-4 text-red-600" />;
    return <ArrowUpDown className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart className="w-6 h-6 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold">Indian Market Prices</h1>
            <p className="text-gray-600">Real-time agricultural commodity prices</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-xl font-bold">{filteredData.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">States Covered</p>
                <p className="text-xl font-bold">{new Set(filteredData.map(item => item.state)).size}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Commodities</p>
                <p className="text-xl font-bold">{new Set(filteredData.map(item => item.commodity)).size}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search commodities, markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
            <Select onValueChange={(value) => handleFilterChange('state', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {SAMPLE_FILTERS.states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleFilterChange('commodity', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select Commodity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Commodities</SelectItem>
                {SAMPLE_FILTERS.commodities.map(commodity => (
                  <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleFilterChange('market', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {SAMPLE_FILTERS.markets.map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleFilterApply} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Apply Filters & Get Data
            </Button>
            <Button onClick={() => fetchMarketData(filters, false)} disabled={loading} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Only
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => { 
              setFilters({}); 
              setSearchQuery(''); 
              setHistoricalData([]);
              setCommodityInfo(null);
              setCurrentPrice(null);
              setSelectedCommodity('');
            }} variant="outline">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Market Prices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
              <p className="ml-2 text-gray-600">Fetching latest market prices...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Data Found</h3>
              <p className="text-gray-600">
                {searchQuery || Object.keys(filters).length > 0 ? 'Try adjusting your filters or search terms' : 'No market data available'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Market Prices Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 cursor-pointer" onClick={() => handleSort('state')}>
                        <div className="flex items-center gap-2">
                          State
                          {sortBy === 'state' && (sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4">Market</th>
                      <th className="text-left py-3 px-4 cursor-pointer" onClick={() => handleSort('commodity')}>
                        <div className="flex items-center gap-2">
                          Commodity
                          {sortBy === 'commodity' && (sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
                        </div>
                      </th>
                      <th className="text-right py-3 px-4">Min Price</th>
                      <th className="text-right py-3 px-4">Max Price</th>
                      <th className="text-right py-3 px-4 cursor-pointer" onClick={() => handleSort('modal_price')}>
                        <div className="flex items-center justify-end gap-2">
                          Modal Price
                          {sortBy === 'modal_price' && (sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
                        </div>
                      </th>
                      <th className="text-center py-3 px-4">Trend</th>
                      <th className="text-center py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">{item.state}</Badge>
                        </td>
                        <td className="py-3 px-4">{item.market}</td>
                        <td className="py-3 px-4 font-medium">{item.commodity}</td>
                        <td className="py-3 px-4 text-right">{formatPrice(item.min_price)}</td>
                        <td className="py-3 px-4 text-right">{formatPrice(item.max_price)}</td>
                        <td className="py-3 px-4 text-right font-bold">{formatPrice(item.modal_price)}</td>
                        <td className="py-3 px-4 text-center">{getPriceTrend(item.min_price, item.max_price, item.modal_price)}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{new Date(item.arrival_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Current Price Summary */}
              {currentPrice && selectedCommodity && (
                <div className="mt-8">
                  <Card className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{selectedCommodity}</h3>
                        {commodityInfo && (
                          <p className="text-sm text-gray-600">{commodityInfo.category} • {commodityInfo.unit}</p>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-4xl font-bold text-blue-600 mb-2">
                          {currentPrice.price}
                        </p>
                        
                        {currentPrice.change && currentPrice.changePercent && (
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-lg font-semibold ${
                              currentPrice.change.startsWith('+') ? 'text-green-600' : 
                              currentPrice.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {currentPrice.change} ({currentPrice.changePercent})
                            </span>
                            {currentPrice.change.startsWith('+') && <span className="text-green-600">↗</span>}
                            {currentPrice.change.startsWith('-') && <span className="text-red-600">↘</span>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Historical Chart */}
              {historicalData.length > 0 && selectedCommodity && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">
                      Historical Prices: {selectedCommodity} 
                      {commodityInfo && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          ({commodityInfo.category} • {commodityInfo.unit})
                        </span>
                      )}
                    </h3>
                  </div>
                  <HistoricalChart graph={historicalData} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        <p>Data sourced from Government of India API</p>
        <p>Last updated: {new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default IndiaMarketTable;