import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

// Generate distribution data helper
const generateDistributionData = (low, med, high) => {
  const points = [];
  for (let i = 0; i <= 100; i += 10) {
    let value;
    if (i <= 30) {
      value = (low / 30) * i;
    } else if (i <= 70) {
      value = med * Math.sin((i - 30) * Math.PI / 40);
    } else {
      value = high * (1 - ((i - 70) / 30));
    }
    points.push({
      score: i,
      value: Math.max(0, value)
    });
  }
  return points;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-medium">Score: {label}</p>
        <p>Value: {payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function TalentDistributionMap({ selectedRegions, selectedUnits }) {
  const [viewMode, setViewMode] = useState("unit");
  const [unitData, setUnitData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch unit data
  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        const response = await fetch("/api/api/reportanalytics/getUnitList", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === "success" && data.units) {
          // Transform the data to include distribution metrics
          const transformedData = {};
          Object.entries(data.units).forEach(([region, units]) => {
            transformedData[region] = units.map(unit => ({
              name: unit,
              low: Math.floor(Math.random() * 20) + 10, // Random values for demo
              med: Math.floor(Math.random() * 20) + 50,
              high: Math.floor(Math.random() * 20) + 10,
              candidates: Math.floor(Math.random() * 2) + 1,
              region // Store region for color coding
            }));
          });
          setUnitData(transformedData);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching unit data:", error);
        setError("Failed to load unit data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnitData();
  }, []);

  const getRegionColor = (region) => {
    const colors = {
      'North': '#1E88E5',
      'South': '#E53935',
      'East': '#43A047',
      'West': '#FB8C00'
    };
    return colors[region] || '#666666';
  };

  const renderUnitDistributions = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    // Flatten and filter units
    const allUnits = selectedRegions.flatMap(region => 
      (unitData[region] || [])
        .filter(unit => selectedUnits.includes(unit.name))
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allUnits.map(unit => (
          <Card key={unit.name} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-lg font-bold text-gray-800">{unit.name}</CardTitle>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {unit.candidates} Candidates
                </span>
              </div>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateDistributionData(unit.low, unit.med, unit.high)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="score"
                      tickFormatter={(value) => {
                        if (value === 0) return 'Low';
                        if (value === 50) return 'Med';
                        if (value === 100) return 'High';
                        return '';
                      }}
                      stroke="#666"
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={getRegionColor(unit.region)}
                      fill={getRegionColor(unit.region)}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Low</div>
                  <div className="font-medium text-gray-800">{unit.low}%</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-xs text-gray-500">Med</div>
                  <div className="font-medium text-gray-800">{unit.med}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">High</div>
                  <div className="font-medium text-gray-800">{unit.high}%</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-gray-50 border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Talent Distribution</CardTitle>
        <CardDescription className="text-gray-600">
          Distribution of talent across selected units
        </CardDescription>
      </CardHeader>
      <CardContent>
        {viewMode === "unit" ? renderUnitDistributions() : null}
      </CardContent>
    </Card>
  );
}
