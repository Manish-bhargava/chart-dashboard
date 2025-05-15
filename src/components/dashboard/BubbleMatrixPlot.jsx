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

// Define competency colors with their specific colors as per requirements
const COMPETENCY_COLORS = {
  'Leadership': '#60a5fa',          // Blue
  'Situation Management': '#f472b6', // Pink
  'Quality in Healthcare Delivery': '#fcd34d', // Yellow
  'Relationship Building': '#4ade80' // Green
};

export function BubbleMatrixPlot({ selectedUnits }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [unitsByRegion, setUnitsByRegion] = useState({});
  const [competencies, setCompetencies] = useState([]);

  // Fetch regions and units data
  useEffect(() => {
    const fetchRegionsAndUnits = async () => {
      try {
        console.log("[Debug] Fetching regions...");
        const regionsResponse = await fetch('/api/reportanalytics/getRegionList', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!regionsResponse.ok) {
          throw new Error(`HTTP error! status: ${regionsResponse.status}`);
        }

        const regionsData = await regionsResponse.json();
        console.log("[Debug] Regions response:", regionsData);
        if (regionsData?.regions) {
          setRegions(regionsData.regions);
        }

        console.log("[Debug] Fetching unit list...");
        const unitListResponse = await fetch('/api/reportanalytics/getUnitList', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!unitListResponse.ok) {
          throw new Error(`HTTP error! status: ${unitListResponse.status}`);
        }

        const unitListData = await unitListResponse.json();
        console.log("[Debug] Units response:", unitListData);
        if (unitListData?.status === "success") {
          setUnitsByRegion(unitListData.units);
        }
      } catch (error) {
        console.error('[Debug] Error fetching regions and units:', error);
        setError('Failed to fetch regions and units data');
      }
    };

    fetchRegionsAndUnits();
  }, []);

  // Helper function to get region for a unit using API data
  const getRegionFromUnit = (unit) => {
    for (const [region, units] of Object.entries(unitsByRegion)) {
      if (units.includes(unit)) {
        return region;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUnits?.length) {
        console.log("[Debug] No units selected");
        setData([]);
        setError("Please select at least one unit");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("[Debug] Fetching competency data for units:", selectedUnits);
        const response = await fetch('/api/reportanalytics/getRadarChartMainCompetency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            unit: selectedUnits
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("[Debug] Competency data response:", responseData);

        if (responseData?.status === "success" && responseData.data) {
          const { section_detail, unit_details } = responseData.data;
          
          // Get competencies from section details
          const competencyList = Object.values(section_detail).map(section => section.section_name);
          setCompetencies(competencyList);
          
          // Group units by region using API data
          const groupedUnits = {};
          Object.keys(unit_details).forEach(unit => {
            const region = getRegionFromUnit(unit);
            console.log("[Debug] Unit:", unit, "Detected Region:", region);
            
            if (region) {
              if (!groupedUnits[region]) {
                groupedUnits[region] = [];
              }
              groupedUnits[region].push(unit);
            }
          });

          // Sort units within each region
          Object.keys(groupedUnits).forEach(region => {
            groupedUnits[region].sort((a, b) => {
              const aIndex = unitsByRegion[region].indexOf(a);
              const bIndex = unitsByRegion[region].indexOf(b);
              return aIndex - bIndex;
            });
          });

          console.log("[Debug] Grouped units:", groupedUnits);

          // Transform data
          const transformedData = [];
          regions.forEach((region, regionIndex) => {
            console.log("[Debug] Processing region:", region, "at index:", regionIndex);
            const unitsInRegion = groupedUnits[region] || [];
            console.log("[Debug] Units in", region, ":", unitsInRegion);

            unitsInRegion.forEach((unit, unitInRegionIndex) => {
              const unitData = unit_details[unit];
              if (unitData) {
                Object.entries(unitData).forEach(([sectionId, scores]) => {
                  const section = section_detail[sectionId];
                  if (section) {
                    // Calculate x position
                    const regionStart = regionIndex;
                    const regionWidth = 0.8;
                    const unitSpacing = regionWidth / Math.max(unitsInRegion.length, 1);
                    const xPos = regionStart + 0.1 + (unitInRegionIndex * unitSpacing);

                    const dataPoint = {
                      unit,
                      region,
                      competency: section.section_name,
                      x: xPos,
                      y: competencyList.indexOf(section.section_name),
                      z: scores.unit_section_score_average * 100,
                      score: scores.unit_section_score_average,
                      percentile: scores.unit_section_score_percentile,
                      nurses: Math.floor(scores.unit_section_score_average * 10),
                      color: COMPETENCY_COLORS[section.section_name],
                      opacity: 0.2 + (scores.unit_section_score_percentile / 100) * 0.8
                    };
                    
                    console.log("[Debug] Created data point:", dataPoint);
                    transformedData.push(dataPoint);
                  }
                });
              }
            });
          });

          console.log("[Debug] Final transformed data:", transformedData);
          setData(transformedData);
        }
      } catch (error) {
        console.error('[Debug] Error in data fetching:', error);
        setError(error.message || 'Failed to fetch data');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedUnits, regions, unitsByRegion]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold">{data.unit}</p>
          <p>Region: {data.region}</p>
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
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(COMPETENCY_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
            <span className="text-sm">{name}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Bubble Size: Number of Nurses</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <span className="text-xs">Small Unit</span>
          <div className="w-4 h-4 rounded-full bg-gray-400 ml-4"></div>
          <span className="text-xs">Large Unit</span>
        </div>
        <p className="text-sm font-semibold mt-2">Color Intensity</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60a5fa', opacity: 0.2 }}></div>
          <span className="text-xs">Low Percentile (0-25%)</span>
          <div className="w-4 h-4 rounded ml-4" style={{ backgroundColor: '#60a5fa', opacity: 0.6 }}></div>
          <span className="text-xs">Mid Percentile (50-75%)</span>
          <div className="w-4 h-4 rounded ml-4" style={{ backgroundColor: '#60a5fa', opacity: 1.0 }}></div>
          <span className="text-xs">High Percentile (75-100%)</span>
        </div>
      </div>
    </div>
  );

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
                name="Region"
                domain={[-0.1, regions.length - 0.1]}
                tickFormatter={(value) => regions[Math.floor(value)] || ''}
                ticks={regions.map((_, i) => i)}
                label={{ value: 'Hospital Units by Region', position: 'bottom', offset: 20 }}
              />
              <XAxis
                type="number"
                dataKey="x"
                axisLine={false}
                tickLine={false}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const unit = data.find(d => Math.abs(d.x - payload.value) < 0.01)?.unit;
                  if (unit) {
                    return (
                      <text x={x} y={y + 10} fill="#666" textAnchor="middle" fontSize={10}>
                        {unit}
                      </text>
                    );
                  }
                  return null;
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Competency"
                domain={[-0.5, competencies.length - 0.5]}
                tickFormatter={(value) => competencies[value] || ''}
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
                  fillOpacity={(d) => d.opacity}
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