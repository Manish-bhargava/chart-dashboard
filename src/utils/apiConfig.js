// When using proxy, we use relative URLs
export const API_BASE_URL = 'https://mhbodhi.medtalent.co/api';

export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://mhbodhi.medtalent.co',
    'Referer': 'https://mhbodhi.medtalent.co'
  };
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}; 