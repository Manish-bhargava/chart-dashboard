import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import axios from 'axios';

// Define competency colors
const COMPETENCY_COLORS = {
  'Leadership': '#60a5fa', // Blue
  'Situation Management': '#f472b6', // Pink
  'Quality in Healthcare Delivery': '#fcd34d', // Yellow
  'Relationship Building': '#4ade80', // Green
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border">
        <p className="font-semibold">{data.unit}</p>
        <p>Competency: {data.competency}</p>
        <p>Score: {data.score.toFixed(2)}</p>
        <p>Percentile: {data.percentile.toFixed(2)}%</p>
        <p>Nurses: {data.nurses}</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => (
  <div className="flex flex-wrap gap-4 justify-center mt-4 p-4 bg-white rounded-lg shadow">
    {Object.entries(COMPETENCY_COLORS).map(([name, color]) => (
      <div key={name} className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
        <span className="text-sm">{name}</span>
      </div>
    ))}
  </div>
);

export function TalentDistributionMap({ selectedUnits }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUnits?.length) {
        setData([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching data for units:", selectedUnits);
        const response = await axios.post(
          'https://mhbodhi.medtalent.co/api/reportanalytics/getRadarChartMainCompetency',
          { unit: selectedUnits },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("API Response:", response.data);

        if (response.data?.status === "success" && response.data.data) {
          const { section_detail, unit_details } = response.data.data;
          
          // Transform data for bubble chart
          const transformedData = [];
          Object.entries(unit_details).forEach(([unit, competencies], unitIndex) => {
            Object.entries(competencies).forEach(([sectionId, scores]) => {
              const section = section_detail[sectionId];
              if (section) {
                // Mock number of nurses (you should replace this with actual data)
                const nursesCount = Math.floor(Math.random() * 50) + 10;

                transformedData.push({
                  unit,
                  competency: section.section_name,
                  x: unitIndex,
                  y: Object.keys(section_detail).indexOf(sectionId),
                  z: nursesCount,
                  score: scores.unit_section_score_average,
                  percentile: scores.unit_section_score_percentile,
                  nurses: nursesCount,
                  color: COMPETENCY_COLORS[section.section_name]
                });
              }
            });
          });

          console.log("Transformed data:", transformedData);
          setData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching bubble matrix data:', error);
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedUnits]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nurse Psychometric Assessment Dashboard</CardTitle>
        <CardDescription>Performance by Region and Hospital Unit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 70, left: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Unit"
                domain={[0, data.length > 0 ? Math.max(...data.map(d => d.x)) : 0]}
                tickFormatter={(value) => {
                  const unit = data.find(d => d.x === value)?.unit || '';
                  return unit;
                }}
                label={{ value: 'Hospital Units', position: 'bottom', offset: 20 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Competency"
                domain={[-0.5, 3.5]}
                tickFormatter={(value) => {
                  const competencies = ['Leadership', 'Situation Management', 'Quality in Healthcare Delivery', 'Relationship Building'];
                  return competencies[value] || '';
                }}
                label={{ value: 'Competency Areas', angle: -90, position: 'insideLeft', offset: -20 }}
              />
              <ZAxis
                type="number"
                dataKey="z"
                range={[400, 2000]}
                name="nurses"
              />
              <Tooltip content={<CustomTooltip />} />
              {Object.entries(COMPETENCY_COLORS).map(([competency, color]) => (
                <Scatter
                  key={competency}
                  name={competency}
                  data={data.filter(item => item.competency === competency)}
                  fill={color}
                  fillOpacity={(d) => 0.3 + (d.percentile / 100) * 0.7}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
