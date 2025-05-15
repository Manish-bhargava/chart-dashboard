import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Maximize2, Minimize2 } from "lucide-react";

// Helper function to determine cell background color based on percentile
const getPercentileBackgroundColor = (value) => {
  if (value === null || value === undefined) return 'bg-gray-100'; // For empty or undefined cells
  if (value >= 90) return 'bg-green-600 text-white'; // Top Tier
  if (value >= 80) return 'bg-green-500 text-white'; // High Performing
  if (value >= 70) return 'bg-lime-500 text-black';  // Above Average
  if (value >= 60) return 'bg-yellow-400 text-black'; // Average
  if (value >= 50) return 'bg-orange-400 text-black'; // Below Average
  if (value >= 40) return 'bg-orange-500 text-white'; // Needs Focus
  return 'bg-red-500 text-white'; // Priority Concern
};

// TODO: User needs to provide this function or its logic
const getScoreBackgroundColor = (value) => {
  if (value === null || value === undefined) return 'bg-gray-100';
  if (value >= 8) return 'bg-green-600 text-white';
  if (value >= 7) return 'bg-green-500 text-white';
  if (value >= 6) return 'bg-lime-500 text-black';
  if (value >= 5) return 'bg-yellow-400 text-black';
  if (value >= 4) return 'bg-orange-400 text-black';
  if (value >= 3) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
};

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) {
  console.error('VITE_API_URL is not defined in environment variables');
}

// Ensure BASE_URL ends with a slash
const apiBaseUrl = BASE_URL?.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

// Helper function to get color based on value
const getHeatMapColor = (value, isPercentile) => {
  if (value === null || value === undefined) return "#f3f4f6"; // gray-100 for empty cells
  
  // Normalize value to 0-100 range
  const normalizedValue = isPercentile ? value : (value * 10);
  
  // More distinct color ranges
  if (normalizedValue >= 90) return "#1e40af"; // dark blue for top tier
  if (normalizedValue >= 80) return "#059669"; // emerald-600 for high performing
  if (normalizedValue >= 70) return "#7c3aed"; // purple-600 for above average
  if (normalizedValue >= 60) return "#fbbf24"; // amber-400 for average
  if (normalizedValue >= 50) return "#f97316"; // orange-500 for below average
  if (normalizedValue >= 40) return "#dc2626"; // red-600 for needs focus
  return "#991b1b"; // dark red for priority concern
};

export function HeatmapView({ selectedUnits }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState("score"); // "score" or "percentile"
  const [heatMapData, setHeatMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCompetencyFilter, setSelectedCompetencyFilter] = useState('all'); // 'all' or a specific section_id

  useEffect(() => {
    const fetchHeatMapData = async () => {
      if (!selectedUnits?.length) {
        setHeatMapData(null);
        setError("Please select at least one unit");
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log("[Debug] Fetching heatmap data for units:", selectedUnits);
        
        const response = await fetch('/api/reportanalytics/getRadarChartMainCompetency', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            unit: selectedUnits
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[Debug] Heatmap API Response:", data);

        if (data?.status === "success" && data.data) {
          if (!data.data.section_detail || !data.data.unit_details) {
            throw new Error("Invalid data structure received from API");
          }
          setHeatMapData(data.data);
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (error) {
        console.error("[Debug] Error fetching heat map data:", error);
        setError(error.message || "Failed to fetch heatmap data");
        setHeatMapData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatMapData();
  }, [selectedUnits]);

  const processedData = useMemo(() => {
    if (!heatMapData) return { headers: [], rows: [], competencyOptions: [] };

    const { section_detail, unit_details } = heatMapData;
    if (!section_detail || !unit_details) {
      console.error("[Debug] Invalid heatmap data structure:", heatMapData);
      return { headers: [], rows: [], competencyOptions: [] };
    }

    console.log("[Debug] Processing heatmap data:", { section_detail, unit_details });

    const competencyOptions = [
      { value: 'all', label: 'Overview (All Competencies)' },
      ...Object.values(section_detail).map(s => ({ value: s.quiz_section_id, label: s.section_name }))
    ];

    let competencyHeaders = Object.values(section_detail);
    if (selectedCompetencyFilter !== 'all') {
      competencyHeaders = competencyHeaders.filter(s => s.quiz_section_id === selectedCompetencyFilter);
    }

    const headers = ['Hospital Unit', ...competencyHeaders.map(s => s.section_name), 'Overall'];

    const rows = selectedUnits.map(unitName => {
      const unitData = unit_details[unitName];
      if (!unitData) {
        console.warn(`[Debug] No data found for unit: ${unitName}`);
        return null;
      }

      const rowValues = {};
      let sumForOverall = 0;
      let countForOverall = 0;

      competencyHeaders.forEach(comp => {
        const sectionId = comp.quiz_section_id;
        const valueObj = unitData[sectionId];
        let value = null;
        if (valueObj) {
          value = viewMode === 'score' ? 
            valueObj.unit_section_score_average : 
            valueObj.unit_section_score_percentile;
          if (typeof value === 'number' && !isNaN(value)) {
            sumForOverall += value;
            countForOverall++;
          }
        }
        rowValues[comp.section_name] = value;
      });
      
      const overallValue = countForOverall > 0 ? (sumForOverall / countForOverall) : null;
      // For percentile view, overall should also be a percentile. Averaging percentiles is tricky.
      // For now, it's a direct average. This might need refinement based on statistical best practices for percentiles.
      // For score view, averaging scores is fine.

      return {
        unitName,
        values: rowValues,
        overall: overallValue !== null ? parseFloat(overallValue.toFixed(2)) : null,
      };
    }).filter(row => row !== null);

    console.log("[Debug] Processed data:", { headers, rows, competencyOptions });
    return { headers, rows, competencyOptions };
  }, [heatMapData, viewMode, selectedCompetencyFilter, selectedUnits]);

  const performanceLegend = [
    { label: '90%+: Top Tier', color: 'bg-blue-800' },         // dark blue
    { label: '80-89%: High Performing', color: 'bg-emerald-600' }, // emerald
    { label: '70-79%: Above Average', color: 'bg-purple-600' }, // purple
    { label: '60-69%: Average', color: 'bg-amber-400' },       // amber
    { label: '50-59%: Below Average', color: 'bg-orange-500' }, // orange
    { label: '40-49%: Needs Focus', color: 'bg-red-600' },     // bright red
    { label: '<40%: Priority Concern', color: 'bg-red-900' },   // dark red
  ];

  // TODO: User needs to provide scoreRangesForColoring for 'scores' viewMode
  const scoreRangesForColoring = {}; // Example: { topTier: {min: 45, max: 50, color: 'bg-green-600'}, ... }

  const renderHeatMap = () => {
    if (!heatMapData || !heatMapData.section_detail || !heatMapData.unit_details) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    const sections = Object.values(heatMapData.section_detail);
    const units = Object.keys(heatMapData.unit_details);

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border"></th>
                {sections.map((section) => (
                  <th key={section.quiz_section_id} className="p-2 border text-sm font-medium">
                    {section.section_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit}>
                  <td className="p-2 border font-medium">{unit}</td>
                  {sections.map((section) => {
                    const sectionData = heatMapData.unit_details[unit][section.quiz_section_id];
                    const value = viewMode === "score" 
                      ? sectionData?.unit_section_score_average
                      : sectionData?.unit_section_score_percentile;
                    
                    return (
                      <td
                        key={section.quiz_section_id}
                        className="p-2 border text-center"
                        style={{
                          backgroundColor: getHeatMapColor(value, viewMode === "percentile"),
                          color: "black",
                        }}
                      >
                        {value?.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2">Performance Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {performanceLegend.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading heatmap data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <p className="mt-2 text-sm text-gray-600">Please try selecting different units or refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 ease-in-out ${isZoomed ? "fixed inset-0 z-50" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Competency Heat Map</CardTitle>
          <CardDescription>
            {viewMode === "score" ? "Average scores" : "Percentile rankings"} across units and competencies
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsZoomed(!isZoomed)} className="ml-auto">
          {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="score">Score View</TabsTrigger>
              <TabsTrigger value="percentile">Percentile View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {selectedUnits?.length > 0 ? (
          renderHeatMap()
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please select at least one unit to view the heat map</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
