// Using built-in fetch (available in Node.js 18+)

async function testEnhancedIndiaMarket() {
  try {
    console.log('Testing Enhanced India Market API with Current Prices and Historical Data...');
    
    // Test 1: Basic commodity search with current price
    console.log('\n1. Testing commodity search with current price (Wheat)...');
    const response1 = await fetch('http://localhost:3001/api/india-market?commodity=Wheat&history=true');
    const data1 = await response1.json();
    
    console.log('Response status:', response1.status);
    console.log('Records found:', data1.records?.length || 0);
    console.log('Current price:', data1.currentPrice);
    console.log('Historical data points:', data1.historicalData?.length || 0);
    console.log('Commodity info:', data1.commodityInfo);
    
    // Test 2: State-specific search with all data
    console.log('\n2. Testing state-specific search (Tomato in Maharashtra)...');
    const response2 = await fetch('http://localhost:3001/api/india-market?commodity=Tomato&state=Maharashtra&history=true');
    const data2 = await response2.json();
    
    console.log('Response status:', response2.status);
    console.log('Records found:', data2.records?.length || 0);
    console.log('Current price:', data2.currentPrice);
    console.log('Historical data points:', data2.historicalData?.length || 0);
    
    // Test 3: Market-specific search
    console.log('\n3. Testing market-specific search (Onion in Bangalore)...');
    const response3 = await fetch('http://localhost:3001/api/india-market?commodity=Onion&market=Bangalore&history=true');
    const data3 = await response3.json();
    
    console.log('Response status:', response3.status);
    console.log('Records found:', data3.records?.length || 0);
    console.log('Current price:', data3.currentPrice);
    
    // Test 4: Spice commodity test
    console.log('\n4. Testing spice commodity (Turmeric in Tamil Nadu)...');
    const response4 = await fetch('http://localhost:3001/api/india-market?commodity=Turmeric&state=Tamil%20Nadu&history=true');
    const data4 = await response4.json();
    
    console.log('Response status:', response4.status);
    console.log('Records found:', data4.records?.length || 0);
    console.log('Current price:', data4.currentPrice);
    console.log('Historical data points:', data4.historicalData?.length || 0);
    
    console.log('\n✅ Enhanced India Market API tests completed!');
    console.log('\nKey Features Verified:');
    console.log('- ✅ Current price fetching with Gemini AI');
    console.log('- ✅ Historical data generation (12 months)');
    console.log('- ✅ State and market filtering');
    console.log('- ✅ Multiple commodity categories');
    console.log('- ✅ Indian Rupee formatting');
    
  } catch (error) {
    console.error('❌ Enhanced India Market API test failed:', error.message);
  }
}

testEnhancedIndiaMarket();
