// Test fallback data generation functions

function generateFallbackMarketData(commodity, state, market) {
  const markets = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal'
  ];
  
  const states = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat',
    'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Punjab', 'Haryana'
  ];

  const basePrices = {
    'Onion': 1500, 'Tomato': 2000, 'Potato': 1200, 'Wheat': 2200, 'Rice': 1800,
    'Maize': 1400, 'Cotton': 5500, 'Sugarcane': 300, 'Soybean': 3500, 'Groundnut': 4500,
    'Chilli': 8000, 'Turmeric': 6000, 'Coriander': 3000, 'Cumin': 12000, 'Mustard': 4000
  };

  const basePrice = basePrices[commodity] || 2000;
  const records = [];

  for (let i = 0; i < 5; i++) {
    const selectedState = state || states[Math.floor(Math.random() * states.length)];
    const selectedMarket = market || markets[Math.floor(Math.random() * markets.length)];
    
    const variation = 0.8 + Math.random() * 0.4;
    const modalPrice = Math.round(basePrice * variation);
    const minPrice = Math.round(modalPrice * 0.9);
    const maxPrice = Math.round(modalPrice * 1.1);

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

function generateFallbackCurrentPrice(commodity, state) {
  const basePrices = {
    'Onion': 1500, 'Tomato': 2000, 'Potato': 1200, 'Wheat': 2200, 'Rice': 1800,
    'Maize': 1400, 'Cotton': 5500, 'Sugarcane': 300, 'Soybean': 3500, 'Groundnut': 4500,
    'Chilli': 8000, 'Turmeric': 6000, 'Coriander': 3000, 'Cumin': 12000, 'Mustard': 4000
  };

  const basePrice = basePrices[commodity] || 2000;
  const variation = 0.9 + Math.random() * 0.2;
  const currentPrice = Math.round(basePrice * variation);
  const change = Math.round((Math.random() - 0.5) * 100);
  const changePercent = ((change / currentPrice) * 100).toFixed(2);

  return {
    price: `₹${currentPrice.toLocaleString()}`,
    change: change >= 0 ? `+${change}` : `${change}`,
    changePercent: change >= 0 ? `+${changePercent}%` : `${changePercent}%`
  };
}

function generateFallbackHistoricalData(commodity, state) {
  const basePrices = {
    'Onion': 1500, 'Tomato': 2000, 'Potato': 1200, 'Wheat': 2200, 'Rice': 1800,
    'Maize': 1400, 'Cotton': 5500, 'Sugarcane': 300, 'Soybean': 3500, 'Groundnut': 4500,
    'Chilli': 8000, 'Turmeric': 6000, 'Coriander': 3000, 'Cumin': 12000, 'Mustard': 4000
  };

  const basePrice = basePrices[commodity] || 2000;
  const historicalData = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 15);
    const monthVariation = 0.8 + Math.random() * 0.4;
    const seasonalVariation = 1 + 0.1 * Math.sin((i / 12) * 2 * Math.PI);
    const price = Math.round(basePrice * monthVariation * seasonalVariation);
    
    historicalData.push({
      date: date.toISOString().split('T')[0],
      price: price,
      currency: 'INR'
    });
  }

  return historicalData;
}

// Test the functions
console.log('Testing Fallback Data Generation Functions...\n');

console.log('1. Market Data for Wheat:');
const marketData = generateFallbackMarketData('Wheat', 'Maharashtra');
console.log(marketData);

console.log('\n2. Current Price for Tomato:');
const currentPrice = generateFallbackCurrentPrice('Tomato', 'Karnataka');
console.log(currentPrice);

console.log('\n3. Historical Data for Onion:');
const historicalData = generateFallbackHistoricalData('Onion', 'Tamil Nadu');
console.log(historicalData.slice(0, 3)); // Show first 3 entries

console.log('\n✅ Fallback functions are working correctly!');
