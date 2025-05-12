import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Maximize2, Minimize2 } from "lucide-react";
import axios from 'axios';
// Assuming axios is installed, if not, use fetch
// import axios from 'axios'; 

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
const getScoreBackgroundColor = (value, scoreRanges) => {
  // Example: scoreRanges = { topTier: {min: 45, max: 50, color: 'bg-green-600'}, ... }
  // This function needs to be defined based on user's criteria for scores
  if (value === null || value === undefined) return 'bg-gray-100';
  // Placeholder - replace with actual logic based on scoreRanges
  if (value > 25) return 'bg-blue-500 text-white'; 
  if (value > 15) return 'bg-blue-300 text-black';
  return 'bg-blue-100 text-black';
};

const BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get color based on value
const getHeatMapColor = (value, isPercentile) => {
  // Normalize value to 0-1 range
  const normalizedValue = isPercentile ? value / 100 : value / 10;
  
  // Color ranges from red (low) to green (high)
  const colors = [
    { threshold: 0.2, color: "#ff0000" },
    { threshold: 0.4, color: "#ff9900" },
    { threshold: 0.6, color: "#ffff00" },
    { threshold: 0.8, color: "#99ff00" },
    { threshold: 1.0, color: "#00ff00" },
  ];

  for (let i = 0; i < colors.length; i++) {
    if (normalizedValue <= colors[i].threshold) {
      return colors[i].color;
    }
  }
  return colors[colors.length - 1].color;
};

export function HeatmapView({ selectedUnits }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState("score"); // "score" or "percentile"
  const [heatMapData, setHeatMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompetencyFilter, setSelectedCompetencyFilter] = useState('all'); // 'all' or a specific section_id

  useEffect(() => {
    const fetchHeatMapData = async () => {
      if (!selectedUnits?.length) {
        setHeatMapData(null);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}reportanalytics/getRadarChartMainCompetency`,
          {
            unit: selectedUnits,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.status === "success") {
          setHeatMapData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching heat map data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatMapData();
  }, [selectedUnits]);

  const processedData = useMemo(() => {
    if (!heatMapData) return { headers: [], rows: [], competencyOptions: [] };

    const { section_detail, unit_details } = heatMapData;
    if (!section_detail || !unit_details) return { headers: [], rows: [], competencyOptions: [] };

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
      if (!unitData) return null; // Should not happen if API returns data for selectedUnits

      const rowValues = {};
      let sumForOverall = 0;
      let countForOverall = 0;

      competencyHeaders.forEach(comp => {
        const sectionId = comp.quiz_section_id;
        const valueObj = unitData[sectionId];
        let value = null;
        if (valueObj) {
          value = viewMode === 'scores' ? valueObj.unit_section_score_average : valueObj.unit_section_score_percentile;
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

    return { headers, rows, competencyOptions };
  }, [heatMapData, viewMode, selectedCompetencyFilter, selectedUnits]);

  const performanceLegend = [
    { label: '90%+: Top Tier', color: 'bg-green-600' },
    { label: '80-89%: High Performing', color: 'bg-green-500' },
    { label: '70-79%: Above Average', color: 'bg-lime-500' }, 
    { label: '60-69%: Average', color: 'bg-yellow-400' },
    { label: '50-59%: Below Average', color: 'bg-orange-400' },
    { label: '40-49%: Needs Focus', color: 'bg-orange-500' },
    { label: '<40%: Priority Concern', color: 'bg-red-500' },
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
    );
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
