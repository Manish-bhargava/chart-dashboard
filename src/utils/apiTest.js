import axios from 'axios';

export const testApiCalls = async () => {
  try {
    // Test getUnitList API
    console.log('Testing getUnitList API...');
    const unitListResponse = await axios.post('https://mhbodhi.medtalent.co/api/reportanalytics/getUnitList');
    console.log('Raw Unit List Response:', unitListResponse);
    console.log('Response Data:', unitListResponse.data);
    console.log('Response Data Type:', typeof unitListResponse.data);
    console.log('Is Array?', Array.isArray(unitListResponse.data));
    if (Array.isArray(unitListResponse.data)) {
      console.log('First Item Structure:', unitListResponse.data[0]);
    }
    
    // You can add more API test calls here
    // For example:
    // const testListResponse = await axios.get('https://mhbodhi.medtalent.co/api/reportanalytics/getTestList');
    // console.log('Test List Response:', testListResponse.data);
    
  } catch (error) {
    console.error('Error in API test:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

// Run the test
testApiCalls(); 