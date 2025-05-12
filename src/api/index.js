import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Regions and Units
export const getRegions = async () => {
  try {
    const response = await api.get('/regions');
    return response.data;
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw error;
  }
};

export const getUnitsByRegion = async (regionId) => {
  try {
    const response = await api.get(`/regions/${regionId}/units`);
    return response.data;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

// Competencies
export const getMainCompetencies = async () => {
  try {
    const response = await api.get('/competencies');
    return response.data;
  } catch (error) {
    console.error('Error fetching competencies:', error);
    throw error;
  }
};

export const getSubCompetencies = async (competencyId) => {
  try {
    const response = await api.get(`/competencies/${competencyId}/sub-competencies`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sub-competencies:', error);
    throw error;
  }
};

// Performance Data
export const getPerformanceData = async (params) => {
  try {
    const response = await api.get('/performance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw error;
  }
};

// Analytics Data
export const getAnalyticsData = async (params) => {
  try {
    const response = await api.get('/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Talent Distribution
export const getTalentDistribution = async (params) => {
  try {
    const response = await api.get('/talent-distribution', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching talent distribution:', error);
    throw error;
  }
};

// Heat Map Data
export const getHeatMapData = async (params) => {
  try {
    const response = await api.get('/heat-map', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching heat map data:', error);
    throw error;
  }
};

// Bubble Plot Data
export const getBubblePlotData = async (params) => {
  try {
    const response = await api.get('/bubble-plot', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bubble plot data:', error);
    throw error;
  }
}; 