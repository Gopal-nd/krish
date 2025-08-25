import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IndiaApiResponse, Filters, CommodityRecord } from '@/types/types';

// Simple in-memory cache for Gemini responses
const geminiCache = new Map<string, any>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (reduced for more dynamic responses)

// Rate limiting for Gemini API
let lastGeminiCall = 0;


// Cache management
function clearExpiredCache() {
  const now = Date.now();
  geminiCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      geminiCache.delete(key);
    }
  });
}

// Sample Indian market data structure for Gemini
const INDIAN_COMMODITIES = {
  'Onion': { category: 'Vegetables', unit: 'per quintal', states: ['Maharashtra', 'Karnataka', 'Madhya Pradesh'] },
  'Tomato': { category: 'Vegetables', unit: 'per quintal', states: ['Maharashtra', 'Karnataka', 'Andhra Pradesh'] },
  'Potato': { category: 'Vegetables', unit: 'per quintal', states: ['Uttar Pradesh', 'West Bengal', 'Punjab'] },
  'Wheat': { category: 'Grains', unit: 'per quintal', states: ['Punjab', 'Haryana', 'Uttar Pradesh'] },
  'Rice': { category: 'Grains', unit: 'per quintal', states: ['West Bengal', 'Uttar Pradesh', 'Punjab'] },
  'Maize': { category: 'Grains', unit: 'per quintal', states: ['Karnataka', 'Madhya Pradesh', 'Maharashtra'] },
  'Cotton': { category: 'Fibers', unit: 'per quintal', states: ['Gujarat', 'Maharashtra', 'Madhya Pradesh'] },
  'Sugarcane': { category: 'Cash Crops', unit: 'per quintal', states: ['Uttar Pradesh', 'Maharashtra', 'Karnataka'] },
  'Soybean': { category: 'Oilseeds', unit: 'per quintal', states: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan'] },
  'Groundnut': { category: 'Oilseeds', unit: 'per quintal', states: ['Gujarat', 'Andhra Pradesh', 'Tamil Nadu'] },
  'Chilli': { category: 'Spices', unit: 'per quintal', states: ['Andhra Pradesh', 'Karnataka', 'Tamil Nadu'] },
  'Turmeric': { category: 'Spices', unit: 'per quintal', states: ['Tamil Nadu', 'Andhra Pradesh', 'Maharashtra'] },
  'Coriander': { category: 'Spices', unit: 'per quintal', states: ['Rajasthan', 'Madhya Pradesh', 'Gujarat'] },
  'Cumin': { category: 'Spices', unit: 'per quintal', states: ['Rajasthan', 'Gujarat', 'Madhya Pradesh'] },
  'Mustard': { category: 'Oilseeds', unit: 'per quintal', states: ['Rajasthan', 'Haryana', 'Madhya Pradesh'] },
};

// Fallback data generation when Gemini is not available
function generateFallbackMarketData(commodity: string, state?: string, market?: string): CommodityRecord[] {
  const markets = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Dhule', 'Akola', 'Latur', 'Kolhapur',
    'Sangli', 'Satara', 'Ratnagiri', 'Sindhudurg', 'Gadchiroli', 'Chandrapur', 'Yavatmal',
    'Wardha', 'Bhandara', 'Gondia', 'Washim', 'Hingoli', 'Nanded', 'Parbhani', 'Beed',
    'Osmanabad', 'Jalna', 'Buldhana', 'Jalgaon', 'Nandurbar'
  ];
  
  const states = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat',
    'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Punjab', 'Haryana',
    'Bihar', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Assam', 'Kerala', 'Goa'
  ];

  // Base prices for different commodities (per quintal)
  const basePrices: { [key: string]: number } = {
    'Onion': 1500, 'Tomato': 2000, 'Potato': 1200, 'Wheat': 2200, 'Rice': 1800,
    'Maize': 1400, 'Cotton': 5500, 'Sugarcane': 300, 'Soybean': 3500, 'Groundnut': 4500,
    'Chilli': 8000, 'Turmeric': 6000, 'Coriander': 3000, 'Cumin': 12000, 'Mustard': 4000
  };

  const basePrice = basePrices[commodity] || 2000;
  const records: CommodityRecord[] = [];

  // If state is specified, focus on markets in that state
  let availableStates = state ? [state] : states;
  let availableMarkets = market ? [market] : markets;

  for (let i = 0; i < 10; i++) {
    const selectedState = availableStates[Math.floor(Math.random() * availableStates.length)];
    const selectedMarket = availableMarkets[Math.floor(Math.random() * availableMarkets.length)];
    
    // Generate realistic price variations with more randomness
    const variation = 0.7 + Math.random() * 0.6; // ±30% variation
    const modalPrice = Math.round(basePrice * variation);
    const minPrice = Math.round(modalPrice * (0.85 + Math.random() * 0.1)); // 85-95% of modal
    const maxPrice = Math.round(modalPrice * (1.05 + Math.random() * 0.15)); // 105-120% of modal

    records.push({
      state: selectedState,
      market: selectedMarket,
      commodity: commodity,
      modal_price: modalPrice.toString(),
      min_price: minPrice.toString(),
      max_price: maxPrice.toString(),
      arrival_date: new Date().toISOString().split('T')[0]
    });
  }

  return records;
}

async function getGeminiIndiaMarketData(commodity: string, state?: string, market?: string): Promise<CommodityRecord[]> {
  try {
    // Check if Gemini API key is available
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      console.log('Gemini API key not configured, using fallback data generation');
      return generateFallbackMarketData(commodity, state, market);
    }

    // Check cache first
    const cacheKey = `market_${commodity}_${state || 'all'}_${market || 'all'}`;
    const cached = geminiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached Gemini response for market data');
      return cached.data;
    }

    // Rate limiting
    const now = Date.now();
    lastGeminiCall = now;

    // const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const locationFilter = state ? ` in ${state}` : '';
    const marketFilter = market ? ` from ${market} market` : '';
    
    const prompt = `Generate realistic agricultural commodity prices for ${commodity}${locationFilter}${marketFilter} in India.
    
    Return ONLY a JSON array with this exact format for 10 different markets. Do not include any markdown formatting or code blocks:
    [
      {
        "state": "State Name",
        "market": "Market Name", 
        "commodity": "${commodity}",
        "modal_price": "price in rupees",
        "min_price": "minimum price",
        "max_price": "maximum price",
        "arrival_date": "2024-12-19"
      }
    ]
    
    Use realistic prices in Indian Rupees (₹). Include variety in states and markets.
    Make sure all prices are realistic for Indian agricultural markets.
    Generate 10 different market entries with varied prices.
    If state is specified, focus on markets in that state.
    If market is specified, include that market and similar nearby markets.
    Add some randomness to prices and market names to make each response unique.
    Return ONLY the JSON array, no other text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('Gemini response for market data:', response.substring(0, 200) + '...');
    
    // Clean the response by removing markdown code blocks
    let cleanResponse = response;
    if (response.includes('```json')) {
      cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Try to parse JSON from the response - use a more robust regex
    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        // Ensure all records have the required fields
        return data.map((item: any) => ({
          state: item.state || 'Unknown',
          market: item.market || 'Unknown',
          commodity: item.commodity || commodity,
          modal_price: item.modal_price || '0',
          min_price: item.min_price || '0',
          max_price: item.max_price || '0',
          arrival_date: item.arrival_date || new Date().toISOString().split('T')[0]
        }));
      } catch (parseError) {
        console.error('JSON parse error for market data:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        return [];
      }
    }
    
    console.log('No valid JSON array found in Gemini response');
    console.log('Clean response:', cleanResponse.substring(0, 300));
    return [];
  } catch (error) {
    console.error('Gemini India Market API error:', error);
    // Cache the fallback result to avoid repeated failures
    const cacheKey = `market_${commodity}_${state || 'all'}_${market || 'all'}`;
    const fallbackData = generateFallbackMarketData(commodity, state, market);
    geminiCache.set(cacheKey, {
      data: fallbackData,
      timestamp: Date.now()
    });
    return fallbackData;
  }
}

async function getGeminiCurrentPrice(commodity: string, state?: string): Promise<{ price: string; change: string; changePercent: string } | null> {
  try {
    // Check if Gemini API key is available
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      console.log('Gemini API key not configured, using fallback current price generation');
      return generateFallbackCurrentPrice(commodity, state);
    }

    // Check cache first
    const cacheKey = `price_${commodity}_${state || 'all'}`;
    const cached = geminiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached Gemini response for current price');
      return cached.data;
    }

    // Rate limiting


    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const locationFilter = state ? ` in ${state}` : '';
    
    const prompt = `Generate a realistic current market price for ${commodity}${locationFilter} in India.
    
    Return ONLY a JSON object with this exact format. Do not include any markdown formatting or code blocks:
    {
      "price": "current price in rupees with ₹ symbol",
      "change": "price change amount with + or -",
      "changePercent": "percentage change with + or -"
    }
    
    Example: {"price": "₹2,150", "change": "+15", "changePercent": "+0.72%"}
    
    Use realistic prices for Indian agricultural markets. Generate a reasonable price and change.
    Return ONLY the JSON object, no other text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean the response by removing markdown code blocks
    let cleanResponse = response;
    if (response.includes('```json')) {
      cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Try to parse JSON from the response - use a more robust regex
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error for current price:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        return null;
      }
    }
    
    console.log('No valid JSON object found in current price response');
    console.log('Clean response:', cleanResponse.substring(0, 200));
    return null;
  } catch (error) {
    console.error('Gemini Current Price error:', error);
    // Cache the fallback result to avoid repeated failures
    const cacheKey = `price_${commodity}_${state || 'all'}`;
    const fallbackData = generateFallbackCurrentPrice(commodity, state);
    geminiCache.set(cacheKey, {
      data: fallbackData,
      timestamp: Date.now()
    });
    return fallbackData;
  }
}

// Fallback current price generation
function generateFallbackCurrentPrice(commodity: string, state?: string): { price: string; change: string; changePercent: string } | null {
  const basePrices: { [key: string]: number } = {
    'Onion': 1500, 'Tomato': 2000, 'Potato': 1200, 'Wheat': 2200, 'Rice': 1800,
    'Maize': 1400, 'Cotton': 5500, 'Sugarcane': 300, 'Soybean': 3500, 'Groundnut': 4500,
    'Chilli': 8000, 'Turmeric': 6000, 'Coriander': 3000, 'Cumin': 12000, 'Mustard': 4000
  };

  const basePrice = basePrices[commodity] || 2000;
  const variation = 0.9 + Math.random() * 0.2; // ±10% variation
  const currentPrice = Math.round(basePrice * variation);
  const change = Math.round((Math.random() - 0.5) * 100); // ±50 change
  const changePercent = ((change / currentPrice) * 100).toFixed(2);

  return {
    price: `₹${currentPrice.toLocaleString()}`,
    change: change >= 0 ? `+${change}` : `${change}`,
    changePercent: change >= 0 ? `+${changePercent}%` : `${changePercent}%`
  };
}

// Fallback historical data generation
function generateFallbackHistoricalData(commodity: string, state: string): Array<{ date: string; price: number; currency: string }> {
  const basePrices: { [key: string]: number } = {
    'Onion': 1500, 'Tomato': 2000, 'Potato': 1200, 'Wheat': 2200, 'Rice': 1800,
    'Maize': 1400, 'Cotton': 5500, 'Sugarcane': 300, 'Soybean': 3500, 'Groundnut': 4500,
    'Chilli': 8000, 'Turmeric': 6000, 'Coriander': 3000, 'Cumin': 12000, 'Mustard': 4000
  };

  const basePrice = basePrices[commodity] || 2000;
  const historicalData: Array<{ date: string; price: number; currency: string }> = [];
  
  // Generate 12 months of data
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 15); // 15th of each month
    const monthVariation = 0.8 + Math.random() * 0.4; // ±20% variation
    const seasonalVariation = 1 + 0.1 * Math.sin((i / 12) * 2 * Math.PI); // Seasonal pattern
    const price = Math.round(basePrice * monthVariation * seasonalVariation);
    
    historicalData.push({
      date: date.toISOString().split('T')[0],
      price: price,
      currency: 'INR'
    });
  }

  return historicalData;
}

async function getGeminiHistoricalData(commodity: string, state: string): Promise<Array<{ date: string; price: number; currency: string }>> {
  try {
    // Check if Gemini API key is available
    if (!process.env.NEXT_PUBLIC_GEMINI_API2) {
      console.log('Gemini API key not configured, using fallback historical data generation');
      return generateFallbackHistoricalData(commodity, state);
    }

    // Check cache first
    // const cacheKey = `history_${commodity}_${state}`;
    // const cached = geminiCache.get(cacheKey);
    // if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    //   console.log('Using cached Gemini response for historical data');
    //   return cached.data;
    // }

    // Rate limiting
  

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API2);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate realistic historical price data for ${commodity} in ${state}, India for the last 12 months.
    
    Return ONLY a JSON array with this exact format. Do not include any markdown formatting or code blocks:
    [
      {
        "date": "YYYY-MM-DD",
        "price": price_in_rupees,
        "currency": "INR"
      }
    ]
    
    Generate 12 data points (one for each month) with realistic price variations.
    Use Indian Rupee prices. Start from January 2024 to December 2024.
    Make sure prices are realistic for Indian agricultural markets.
    Include seasonal variations and market trends.
    Return ONLY the JSON array, no other text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean the response by removing markdown code blocks
    let cleanResponse = response;
    if (response.includes('```json')) {
      cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Try to parse JSON from the response - use a more robust regex
    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        // Ensure all records have the required fields and proper formatting
        return data.map((item: any) => ({
          date: item.date || new Date().toISOString().split('T')[0],
          price: parseFloat(item.price) || 0,
          currency: item.currency || 'INR'
        }));
      } catch (parseError) {
        console.error('JSON parse error for historical data:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        return [];
      }
    }
    
    console.log('No valid JSON array found in historical data response');
    console.log('Clean response:', cleanResponse.substring(0, 300));
    return [];
  } catch (error) {
    console.error('Gemini Historical Data error:', error);
    // Cache the fallback result to avoid repeated failures
    const cacheKey = `history_${commodity}_${state}`;
    const fallbackData = generateFallbackHistoricalData(commodity, state);
    geminiCache.set(cacheKey, {
      data: fallbackData,
      timestamp: Date.now()
    });
    return fallbackData;
  }
}

async function getOriginalIndiaMarketData(filters: Filters, limit: string, offset: string): Promise<CommodityRecord[]> {
  try {
    const apiKey = process.env.INDIA_API_KEY;
    if (!apiKey) {
      return [];
    }

    const params = new URLSearchParams({
      'api-key': apiKey,
      'format': 'json',
      'limit': limit,
      'offset': offset,
    });

    if (filters.state) params.append('filters[state.keyword]', filters.state);
    if (filters.commodity) params.append('filters[commodity]', filters.commodity);
    if (filters.market) params.append('filters[market]', filters.market);

    const apiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params.toString()}`;
    const data = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });

    if (!data.ok) {
      throw new Error(`India API request failed: ${data.status} ${data.statusText}`);
    }

    const response: IndiaApiResponse = await data.json();
    return response.records || [];
  } catch (error) {
    console.error('Original India API error:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const commodity = url.searchParams.get('commodity');
  const market = url.searchParams.get('market');
  const limit = url.searchParams.get('limit') || '10';
  const offset = url.searchParams.get('offset') || '0';
  const includeHistory = url.searchParams.get('history') === 'true';

  // Clear expired cache entries
  clearExpiredCache();

  try {
    const filters: Filters = {};
    if (state) filters.state = state;
    if (commodity) filters.commodity = commodity;
    if (market) filters.market = market;

    // Always use Gemini for dynamic data based on filters
    let records: CommodityRecord[] = [];
    
    if (commodity) {
      console.log('Using Gemini for dynamic India market data');
      try {
        records = await getGeminiIndiaMarketData(commodity, state || undefined, market || undefined);
      } catch (error) {
        console.error('Gemini API error, using fallback:', error);
        records = generateFallbackMarketData(commodity, state || undefined, market || undefined);
      }
    } else {
      // If no commodity specified, use Gemini with default commodity
      console.log('No commodity specified, using Gemini with default commodity (Wheat)');
      try {
        records = await getGeminiIndiaMarketData('Wheat', state || undefined, market || undefined);
      } catch (error) {
        console.error('Gemini API error, using fallback:', error);
        records = generateFallbackMarketData('Wheat', state || undefined, market || undefined);
      }
    }

    // Get current price and historical data if requested
    let currentPrice = null;
    let historicalData: Array<{ date: string; price: number; currency: string }> = [];
    
    if (includeHistory && commodity) {
      // Only fetch current price and historical data if we have a commodity
      try {
        currentPrice = await getGeminiCurrentPrice(commodity, state || undefined);
        if (state) {
          historicalData = await getGeminiHistoricalData(commodity, state);
        }
      } catch (error) {
        console.error('Error fetching current price or historical data:', error);
        // Use fallback data if Gemini fails
        currentPrice = generateFallbackCurrentPrice(commodity, state || undefined);
        if (state) {
          historicalData = generateFallbackHistoricalData(commodity, state);
        }
      }
    }

    const response = {
      records,
      total: records.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      currentPrice: includeHistory ? currentPrice : undefined,
      historicalData: includeHistory ? historicalData : undefined,
      commodityInfo: commodity ? INDIAN_COMMODITIES[commodity as keyof typeof INDIAN_COMMODITIES] : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('India Market API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch India market data',
      details: (error as Error).message 
    }, { status: 500 });
  }
}