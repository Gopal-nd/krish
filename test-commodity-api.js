const fetch = require('node-fetch');

async function testCommodityAPI() {
  try {
    console.log('Testing Commodity API...');
    
    // Test with Gold
    const response = await fetch('http://localhost:3000/api/commodity?q=GC=F');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.summary && data.summary.price) {
      console.log('✅ API is working! Found price:', data.summary.price);
    } else {
      console.log('❌ API response missing expected data');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testCommodityAPI();
