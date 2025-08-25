// Simple test script to verify inquiry functionality
const testInquiry = async () => {
  console.log("🧪 Testing Inquiry Functionality...");

  // Test 1: Check if equipment exists
  console.log("\n1️⃣  Testing equipment lookup...");
  try {
    const response = await fetch('http://localhost:3001/api/equipment/solar-powered-water-pump');
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Equipment found:", data.title);
      console.log("✅ Equipment slug:", data.slug);
      console.log("✅ Equipment ID:", data.id);
    } else {
      console.log("❌ Equipment not found, status:", response.status);
    }
  } catch (error) {
    console.log("❌ Error fetching equipment:", error.message);
  }

  // Test 2: Check inquiry endpoint (will fail with 401, but that's expected)
  console.log("\n2️⃣  Testing inquiry endpoint...");
  try {
    const response = await fetch('http://localhost:3001/api/equipment/solar-powered-water-pump/inquire', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "Test inquiry message"
      })
    });

    const data = await response.json();
    console.log("✅ Inquiry endpoint responding");
    console.log("✅ Status:", response.status);
    console.log("✅ Response:", data.message || data.error);

    if (response.status === 401) {
      console.log("✅ Authentication check working correctly");
    }

  } catch (error) {
    console.log("❌ Error with inquiry endpoint:", error.message);
  }

  console.log("\n🎉 Test completed!");
};

testInquiry();
