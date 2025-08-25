import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Enhanced commodity data with more details
const COMMODITIES = {
  'GC=F': { name: 'Gold', category: 'Precious Metals', unit: 'per troy oz' },
  'SI=F': { name: 'Silver', category: 'Precious Metals', unit: 'per troy oz' },
  'PL=F': { name: 'Platinum', category: 'Precious Metals', unit: 'per troy oz' },
  'PA=F': { name: 'Palladium', category: 'Precious Metals', unit: 'per troy oz' },
  'CL=F': { name: 'Crude Oil (WTI)', category: 'Energy', unit: 'per barrel' },
  'BZ=F': { name: 'Brent Crude Oil', category: 'Energy', unit: 'per barrel' },
  'NG=F': { name: 'Natural Gas', category: 'Energy', unit: 'per MMBtu' },
  'ZC=F': { name: 'Corn', category: 'Grains', unit: 'per bushel' },
  'ZS=F': { name: 'Soybeans', category: 'Grains', unit: 'per bushel' },
  'ZW=F': { name: 'Wheat', category: 'Grains', unit: 'per bushel' },
  'KC=F': { name: 'Coffee', category: 'Softs', unit: 'per pound' },
  'CT=F': { name: 'Cotton', category: 'Softs', unit: 'per pound' },
  'CC=F': { name: 'Cocoa', category: 'Softs', unit: 'per metric ton' },
  'SB=F': { name: 'Sugar', category: 'Softs', unit: 'per pound' },
  'OJ=F': { name: 'Orange Juice', category: 'Softs', unit: 'per pound' },
  'HE=F': { name: 'Lean Hogs', category: 'Livestock', unit: 'per pound' },
  'LE=F': { name: 'Live Cattle', category: 'Livestock', unit: 'per pound' },
  'GF=F': { name: 'Feeder Cattle', category: 'Livestock', unit: 'per pound' },
  'HG=F': { name: 'Copper', category: 'Industrial Metals', unit: 'per pound' },
  'ALI=F': { name: 'Aluminum', category: 'Industrial Metals', unit: 'per pound' },
  'NID=F': { name: 'Nickel', category: 'Industrial Metals', unit: 'per pound' },
  'ZNC=F': { name: 'Zinc', category: 'Industrial Metals', unit: 'per pound' },
  'HRC=F': { name: 'Steel', category: 'Industrial Metals', unit: 'per ton' },
};

async function getGeminiPrice(ticker: string, commodityName: string): Promise<{ price: string; change: string; changePercent: string } | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Get the current live price for ${commodityName} (${ticker}). 
    Return ONLY a JSON object with this exact format:
    {
      "price": "current price with currency symbol",
      "change": "price change amount with + or -",
      "changePercent": "percentage change with + or -"
    }
    
    Example: {"price": "$2,150.50", "change": "+15.30", "changePercent": "+0.72%"}

    
    If you cannot get the exact price, return null.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse JSON from the response
    const jsonMatch = response.match(/\{.*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

async function getYahooFinanceData(ticker: string): Promise<any> {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`);
    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Yahoo Finance error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ticker = url.searchParams.get('q');
  const window = url.searchParams.get('window') || '1Y';

  if (!ticker) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  const commodityInfo = COMMODITIES[ticker as keyof typeof COMMODITIES];
  if (!commodityInfo) {
    return NextResponse.json({ error: 'Invalid commodity ticker' }, { status: 400 });
  }

  try {
    // Get data from multiple sources
    const [yahooData, geminiData] = await Promise.all([
      getYahooFinanceData(ticker),
      getGeminiPrice(ticker, commodityInfo.name)
    ]);

    // Process Yahoo Finance data
    let summary = {
      price: 'N/A',
      extracted_price: 0,
      currency: 'USD',
      change: 'N/A',
      changePercent: 'N/A'
    };

    let graph: Array<{ date: string; price: number; currency: string }> = [];

    if (yahooData && yahooData.chart && yahooData.chart.result && yahooData.chart.result[0]) {
      const result = yahooData.chart.result[0];
      const quote = result.indicators.quote[0];
      const timestamps = result.timestamp;
      const prices = quote.close;

      // Get current price
      const currentPrice = prices[prices.length - 1];
      const previousPrice = prices[prices.length - 2];
      
      if (currentPrice) {
        summary.price = `$${currentPrice.toFixed(2)}`;
        summary.extracted_price = currentPrice;
        
        if (previousPrice) {
          const change = currentPrice - previousPrice;
          const changePercent = (change / previousPrice) * 100;
          summary.change = change >= 0 ? `+${change.toFixed(2)}` : `${change.toFixed(2)}`;
          summary.changePercent = change >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;
        }
      }

      // Create graph data
      graph = timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString(),
        price: prices[index] || 0,
        currency: 'USD'
      })).filter((point: { price: number }) => point.price > 0);
    }

    // Use Gemini data if Yahoo data is not available
    if (geminiData && summary.price === 'N/A') {
      summary.price = geminiData.price;
      summary.change = geminiData.change;
      summary.changePercent = geminiData.changePercent;
    }

    return NextResponse.json({
      summary: {
        ...summary,
        name: commodityInfo.name,
        category: commodityInfo.category,
        unit: commodityInfo.unit
      },
      graph,
      commodityInfo
    });

  } catch (error) {
    console.error('Commodity API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch commodity data',
      details: (error as Error).message 
    }, { status: 500 });
  }
}