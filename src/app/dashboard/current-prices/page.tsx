'use client';

import React, { useState } from 'react';
import CommoditySelector from '@/components/CommoditySelector';
import PriceDisplay from '@/components/PriceDisplay';
import HistoricalChart from '@/components/HistoricalChart';
import IndiaMarketTable from '@/components/IndiaMarketTable';
import { safeFetch } from '@/lib/fetcher';
import { FinanceData } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Globe, BarChart3, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('indian');

  const handleSelect = async (ticker: string) => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setFinanceData(null);
    setSelectedTicker(ticker);

    try {
      const fetchedData = await safeFetch<FinanceData>(`/api/commodity?q=${encodeURIComponent(ticker)}`);
      console.log(fetchedData);
      setFinanceData(fetchedData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commodity Price Dashboard</h1>
        <p className="text-gray-600">Real-time prices for global and Indian markets</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Global Markets
          </TabsTrigger>
          <TabsTrigger value="indian" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Indian Markets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Global Commodity Prices</h2>
              </div>
              
              <div className="max-w-md mx-auto mb-6">
                <CommoditySelector onSelect={handleSelect} />
              </div>
              
              {loading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Fetching live prices...</p>
                </div>
              )}
              
              {error && (
                <Alert className="border-red-200 mb-6">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    Error: {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {financeData && (
                <div className="space-y-6">
                  <PriceDisplay summary={financeData.summary} />
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Historical Performance (1 Year)</h3>
                  </div>
                  <HistoricalChart graph={financeData.graph} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600">
            <p>Data sourced from Yahoo Finance and enhanced with AI-powered price verification</p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </TabsContent>

        <TabsContent value="indian" className="space-y-6">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold">Indian Agricultural Markets</h2>
              </div>
              
              <div className="text-center text-sm text-gray-600 mb-6">
                <p>Real-time agricultural commodity prices from Indian markets</p>
                <p>Powered by AI for dynamic data generation</p>
              </div>
            </CardContent>
          </Card>
          
          <IndiaMarketTable />
        </TabsContent>
      </Tabs>
    </main>
  );
}