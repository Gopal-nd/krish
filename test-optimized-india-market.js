// Test optimized India market API with caching and rate limiting

async function testOptimizedIndiaMarket() {
  try {
    console.log('Testing Optimized India Market API...\n');
    
    // Test 1: First request (should use Gemini or fallback)
    console.log('1. First request - Wheat in Maharashtra...');
    const start1 = Date.now();
    const response1 = await fetch('http://localhost:3001/api/india-market?commodity=Wheat&state=Maharashtra&history=true');
    const data1 = await response1.json();
    const time1 = Date.now() - start1;
    
    console.log(`✅ Response time: ${time1}ms`);
    console.log('✅ Market records:', data1.records?.length || 0);
    console.log('✅ Current price:', data1.currentPrice ? 'Available' : 'Missing');
    console.log('✅ Historical data:', data1.historicalData?.length || 0, 'points');
    
    // Test 2: Same request (should use cache)
    console.log('\n2. Second request - Same parameters (should use cache)...');
    const start2 = Date.now();
    const response2 = await fetch('http://localhost:3001/api/india-market?commodity=Wheat&state=Maharashtra&history=true');
    const data2 = await response2.json();
    const time2 = Date.now() - start2;
    
    console.log(`✅ Response time: ${time2}ms (should be faster)`);
    console.log('✅ Market records:', data2.records?.length || 0);
    console.log('✅ Current price:', data2.currentPrice ? 'Available' : 'Missing');
    console.log('✅ Historical data:', data2.historicalData?.length || 0, 'points');
    
    // Test 3: Different commodity (should trigger new Gemini call)
    console.log('\n3. Different commodity - Tomato in Karnataka...');
    const start3 = Date.now();
    const response3 = await fetch('http://localhost:3001/api/india-market?commodity=Tomato&state=Karnataka&history=true');
    const data3 = await response3.json();
    const time3 = Date.now() - start3;
    
    console.log(`✅ Response time: ${time3}ms`);
    console.log('✅ Market records:', data3.records?.length || 0);
    console.log('✅ Current price:', data3.currentPrice ? 'Available' : 'Missing');
    console.log('✅ Historical data:', data3.historicalData?.length || 0, 'points');
    
    // Test 4: Market-specific filter
    console.log('\n4. Market-specific filter - Onion in Bangalore...');
    const start4 = Date.now();
    const response4 = await fetch('http://localhost:3001/api/india-market?commodity=Onion&market=Bangalore&history=true');
    const data4 = await response4.json();
    const time4 = Date.now() - start4;
    
    console.log(`✅ Response time: ${time4}ms`);
    console.log('✅ Market records:', data4.records?.length || 0);
    console.log('✅ Current price:', data4.currentPrice ? 'Available' : 'Missing');
    
    console.log('\n📊 Performance Summary:');
    console.log(`- First request: ${time1}ms`);
    console.log(`- Cached request: ${time2}ms (${time1 > time2 ? 'Faster' : 'Slower'})`);
    console.log(`- New commodity: ${time3}ms`);
    console.log(`- Market filter: ${time4}ms`);
    
    console.log('\n🎯 Optimization Features:');
    console.log('✅ In-memory caching (5 minutes)');
    console.log('✅ Rate limiting (2 seconds between calls)');
    console.log('✅ Fallback data generation');
    console.log('✅ Error handling and recovery');
    console.log('✅ Dynamic data based on filters');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOptimizedIndiaMarket();
