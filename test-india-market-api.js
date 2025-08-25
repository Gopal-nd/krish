// Using built-in fetch (available in Node.js 18+)

async function testIndiaMarketAPI() {
  try {
    console.log('Testing Enhanced India Market API...');
    
    // Test 1: Basic commodity search
    console.log('\n1. Testing basic commodity search (Wheat)...');
    const response1 = await fetch('http://localhost:3001/api/india-market?commodity=Wheat&limit=5');
    const data1 = await response1.json();
    
    console.log('Response status:', response1.status);
    console.log('Records found:', data1.records?.length || 0);
    if (data1.records && data1.records.length > 0) {
      console.log('Sample record:', data1.records[0]);
    }
    
    // Test 2: With historical data
    console.log('\n2. Testing with historical data...');
    const response2 = await fetch('http://localhost:3001/api/india-market?commodity=Wheat&state=Maharashtra&history=true');
    const data2 = await response2.json();
    
    console.log('Response status:', response2.status);
    console.log('Records found:', data2.records?.length || 0);
    console.log('Historical data points:', data2.historicalData?.length || 0);
    console.log('Commodity info:', data2.commodityInfo);
    
    if (data2.historicalData && data2.historicalData.length > 0) {
      console.log('Sample historical data:', data2.historicalData[0]);
    }
    
    // Test 3: State filter
    console.log('\n3. Testing state filter...');
    const response3 = await fetch('http://localhost:3001/api/india-market?state=Karnataka&limit=3');
    const data3 = await response3.json();
    
    console.log('Response status:', response3.status);
    console.log('Records found:', data3.records?.length || 0);
    
    console.log('\n✅ India Market API tests completed!');
    
  } catch (error) {
    console.error('❌ India Market API test failed:', error.message);
  }
}

testIndiaMarketAPI();
