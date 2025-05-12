import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border">
        <p className="font-bold">{data.unit}</p>
        <p className="text-sm text-gray-600">Region: {data.region}</p>
        <p className="text-sm text-gray-600">Competency: {data.competency}</p>
        <p className="text-sm text-gray-600">Nurses: {data.nurses}</p>
        <p className="text-sm text-gray-600">Percentile: {data.percentile}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ competencies }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <div className="font-bold mb-4">Legend</div>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="font-semibold mb-2">Bubble Size:</div>
        <div className="text-sm text-gray-600 mb-1">Number of Nurses</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
          <span className="text-sm">Small Unit (25 nurses)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300"></div>
          <span className="text-sm">Large Unit (45 nurses)</span>
        </div>
      </div>
      <div>
        <div className="font-semibold mb-2">Competency Areas:</div>
        {competencies.map((comp) => (
          <div key={comp.name} className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: comp.color }}></div>
            <span className="text-sm">{comp.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export function BubbleMatrixPlot({ selectedRegions, selectedUnits }) {
  const [data, setData] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch competencies from API
        const competenciesResponse = await fetch('https://mhbodhi.medtalent.co/api/reportanalytics/getCompetencies', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!competenciesResponse.ok) {
          throw new Error('Failed to fetch competencies');
        }
        
        const competenciesData = await competenciesResponse.json();
        const formattedCompetencies = competenciesData.data.map((comp, index) => ({
          name: comp.name,
          color: getColorForIndex(index)
        }));
        setCompetencies(formattedCompetencies);

        // Fetch bubble matrix data
        const response = await fetch('https://mhbodhi.medtalent.co/api/reportanalytics/getBubbleMatrixData', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            regions: selectedRegions,
            units: selectedUnits
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bubble matrix data');
        }

        const responseData = await response.json();
        
        // Transform the API data into the format needed for the chart
        const transformedData = responseData.data.map(item => ({
          x: item.region === 'South' ? 1 : 2,
          y: competenciesData.data.findIndex(comp => comp.name === item.competency),
          z: item.nurses,
          unit: item.unit,
          region: item.region,
          competency: item.competency,
          percentile: item.percentile,
          nurses: item.nurses
        }));

        setData(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedRegions, selectedUnits]);

  // Helper function to generate colors for competencies
  const getColorForIndex = (index) => {
    const colors = [
      '#90CAF9', // Blue
      '#F48FB1', // Pink
      '#FFE082', // Yellow
      '#A5D6A7', // Green
      '#B39DDB', // Purple
      '#FFAB91', // Orange
      '#80CBC4', // Teal
      '#CE93D8'  // Light Purple
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          Nurse Psychometric Assessment Dashboard
        </CardTitle>
        <CardDescription className="text-gray-600">
          Performance by Region and Hospital Unit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 70, left: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 3]}
                tickFormatter={(value) => {
                  if (value === 1) return 'South';
                  if (value === 2) return 'North';
                  return '';
                }}
                label={{ value: 'Regions', position: 'bottom', offset: 20 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[-0.5, competencies.length - 0.5]}
                tickFormatter={(value) => competencies[value]?.name || ''}
                label={{ value: 'Competency Areas', angle: -90, position: 'insideLeft', offset: -20 }}
              />
              <ZAxis
                type="number"
                dataKey="z"
                range={[400, 2000]}
                name="nurses"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend competencies={competencies} />} />
              {competencies.map((comp, index) => (
                <Scatter
                  key={comp.name}
                  name={comp.name}
                  data={data.filter(item => item.competency === comp.name)}
                  fill={comp.color}
                  fillOpacity={(d) => 0.3 + (d.percentile / 100) * 0.7}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 