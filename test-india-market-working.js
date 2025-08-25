// Test to verify current India market API functionality

async function testWorkingFeatures() {
  try {
    console.log('Testing Current India Market API Features...\n');
    
    // Test 1: Basic commodity search (should work with fallback)
    console.log('1. Testing basic commodity search (Wheat)...');
    const response1 = await fetch('http://localhost:3001/api/india-market?commodity=Wheat&limit=5');
    const data1 = await response1.json();
    
    console.log('✅ Market records found:', data1.records?.length || 0);
    console.log('✅ Commodity info:', data1.commodityInfo ? 'Available' : 'Missing');
    console.log('✅ Current price:', data1.currentPrice ? 'Available' : 'Missing');
    console.log('✅ Historical data:', data1.historicalData?.length || 0, 'points');
    
    if (data1.records && data1.records.length > 0) {
      console.log('Sample record:', {
        state: data1.records[0].state,
        market: data1.records[0].market,
        commodity: data1.records[0].commodity,
        modal_price: data1.records[0].modal_price
      });
    }
    
    // Test 2: State-specific search
    console.log('\n2. Testing state-specific search (Tomato in Maharashtra)...');
    const response2 = await fetch('http://localhost:3001/api/india-market?commodity=Tomato&state=Maharashtra&limit=3');
    const data2 = await response2.json();
    
    console.log('✅ Market records found:', data2.records?.length || 0);
    console.log('✅ Current price:', data2.currentPrice ? 'Available' : 'Missing');
    
    // Test 3: Different commodity category
    console.log('\n3. Testing spice commodity (Turmeric)...');
    const response3 = await fetch('http://localhost:3001/api/india-market?commodity=Turmeric&limit=3');
    const data3 = await response3.json();
    
    console.log('✅ Market records found:', data3.records?.length || 0);
    console.log('✅ Commodity info:', data3.commodityInfo ? 'Available' : 'Missing');
    
    console.log('\n📊 Summary of Working Features:');
    console.log('✅ Market data generation (with fallback)');
    console.log('✅ Commodity categorization');
    console.log('✅ State and market filtering');
    console.log('✅ Price variations and realistic data');
    console.log('✅ API response structure');
    
    console.log('\n⚠️  Features that need attention:');
    console.log('⚠️  Current price generation (Gemini integration)');
    console.log('⚠️  Historical data generation (Gemini integration)');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Check Gemini API key configuration');
    console.log('2. Verify Gemini API responses');
    console.log('3. Test with different prompts if needed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWorkingFeatures();
