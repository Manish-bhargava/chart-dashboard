import React, { useState, useEffect, useMemo } from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { CustomTooltip } from "./CustomTooltip"
import { toast } from "react-hot-toast"
import { API_URL } from '../../config'

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) {
  console.error('VITE_API_URL environment variable is not set');
  toast.error('API configuration error');
}

// Ensure BASE_URL ends with a slash
const apiBaseUrl = BASE_URL?.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

export function RadarChartView({ selectedRegions, selectedUnits, unitsByRegion = {} }) {
  const [selectedCompetencies, setSelectedCompetencies] = useState([])
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState([])
  const [chartType, setChartType] = useState("area")
  const [activeView, setActiveView] = useState("chart")
  const [viewMode, setViewMode] = useState("competency")
  const [selectedMainCompetency, setSelectedMainCompetency] = useState("")
  const [apiData, setApiData] = useState(null)
  const [subCompetencyData, setSubCompetencyData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [subCompetencyScores, setSubCompetencyScores] = useState(null)

  // Fetch main competency data
  useEffect(() => {
    const fetchRadarData = async () => {
      if (!selectedUnits || selectedUnits.length === 0) return

      setIsLoading(true)
      try {
        console.log('Fetching radar data for units:', selectedUnits);
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
        console.log('Radar data response:', data);
        
        if (data.status === "success") {
          setApiData(data.data)
          
          // Extract competency names from API data
          if (data.data && data.data.section_detail) {
            const competencies = Object.values(data.data.section_detail).map(section => section.section_name)
            setSelectedCompetencies(competencies)
          }
        } else {
          toast.error("Failed to fetch radar chart data")
        }
      } catch (error) {
        console.error("Error fetching radar data:", error)
        toast.error("An error occurred while fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRadarData()
  }, [selectedUnits])

  // Fetch subcompetency data
  useEffect(() => {
    const fetchSubCompetencyData = async () => {
      setIsLoading(true)
      try {
        console.log('Fetching subcompetency data');
        const response = await fetch('/api/reportanalytics/getSubCompetency', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Subcompetency data response:', data);
        
        if (data.status === "success") {
          setSubCompetencyData(data.data)
        } else {
          toast.error("Failed to fetch subcompetency data")
        }
      } catch (error) {
        console.error("Error fetching subcompetency data:", error)
        toast.error("An error occurred while fetching subcompetency data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubCompetencyData()
  }, [])

  // Fetch sub-competency scores when a main competency is selected
  useEffect(() => {
    const fetchSubCompetencyScores = async () => {
      if (!selectedMainCompetency || !selectedUnits || selectedUnits.length === 0 || !apiData) return;

      setIsLoading(true);
      try {
        // Find the section ID for the selected main competency
        const sectionId = Object.entries(apiData?.section_detail || {}).find(
          ([_, section]) => section.section_name === selectedMainCompetency
        )?.[0];

        if (!sectionId) {
          console.error("Section ID not found for selected competency");
          return;
        }

        console.log('Fetching sub-competency scores for section:', sectionId);
        const requestBody = {
          unit: selectedUnits,
          section_id: [parseInt(sectionId)],
          report_type: "chart"
        };
        console.log('Request body for sub-competency scores:', requestBody);
        const response = await fetch('/api/reportanalytics/getSubCometencyUnitReport', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Sub-competency scores response:', data);
        
        if (data.status === "success") {
          setSubCompetencyScores(data.data);
        } else {
          toast.error("Failed to fetch sub-competency scores");
        }
      } catch (error) {
        console.error("Error fetching sub-competency scores:", error);
        toast.error("An error occurred while fetching sub-competency scores");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubCompetencyScores();
  }, [selectedMainCompetency, selectedUnits, apiData]);

  const generateData = (apiData, selectedUnits) => {
    if (!apiData || !apiData.section_detail || !apiData.unit_details) return []
    
    if (viewMode === "competency") {
      // Get competencies from API data
      const competencies = Object.values(apiData.section_detail).map(section => section.section_name)
      const dataPoints = competencies.map(comp => {
        const dataPoint = {
          subject: comp,
        }
        selectedUnits.forEach((unit) => {
          const unitData = apiData.unit_details[unit]
          if (unitData) {
            const sectionId = Object.entries(apiData.section_detail).find(
              ([_, section]) => section.section_name === comp
            )?.[0]
            if (sectionId && unitData[sectionId]) {
              // Use exact value from API without multiplication
              dataPoint[unit] = unitData[sectionId].unit_section_score_average
              console.log(`Raw data point for ${unit}, ${comp}:`, dataPoint[unit]);
            }
          }
        })
        return dataPoint
      })
      console.log('Raw data points:', dataPoints);
      return dataPoints;
    } else {
      if (!selectedMainCompetency || !subCompetencyData || !subCompetencyScores) return []
      
      // Find the selected competency in the subcompetency data
      const competencySection = subCompetencyData.find(
        section => section.section_name === selectedMainCompetency
      )
      
      if (!competencySection) return []

      // Find the section ID for the selected main competency
      const sectionId = Object.entries(apiData?.section_detail || {}).find(
        ([_, section]) => section.section_name === selectedMainCompetency
      )?.[0];

      if (!sectionId) return [];
      
      // Get topics (subcompetencies) from the API data
      const subCompetencies = competencySection.topics.map(topic => topic.topic_name)
      const topicIdMap = competencySection.topics.reduce((acc, topic) => {
        acc[topic.topic_name] = topic.topic_id;
        return acc;
      }, {});
      
      return subCompetencies.map(sub => {
        const dataPoint = {
          subject: sub,
        }
        selectedUnits.forEach((unit) => {
          // Get the topic ID for this sub-competency
          const topicId = topicIdMap[sub];
          if (!topicId) return;

          // Get the unit's data from the scores
          const unitData = subCompetencyScores[unit];
          if (!unitData || !unitData[sectionId]) return;

          // Use exact value from API without multiplication
          const topicScore = unitData[sectionId].topic_detail[topicId]?.unit_topic_score_average || 0;
          dataPoint[unit] = topicScore;
        })
        return dataPoint
      })
    }
  }

  const data = generateData(apiData, selectedUnits)

  // Generate colors for units
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", 
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#a4de6c", "#d0ed57", "#ffc658", "#8dd1e1"
  ]

  const renderAnalyticsView = () => {
    if (!selectedUnits || selectedUnits.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Select at least one unit to view analytics</p>
        </div>
      )
    }

    const calculateMetrics = () => {
      // Calculate area covered by each unit
      const unitAreas = {};
      selectedUnits.forEach(unit => {
        let area = 0;
        data.forEach(item => {
          area += item[unit];
        });
        unitAreas[unit] = area;
      });

      // Calculate variations for each unit
      const unitVariations = {};
      selectedUnits.forEach(unit => {
        const values = data.map(item => item[unit]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        unitVariations[unit] = Math.sqrt(variance);
      });

      // Calculate competency variations
      const competencyVariations = {};
      data.forEach(item => {
        const values = selectedUnits.map(unit => item[unit]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        competencyVariations[item.subject] = Math.sqrt(variance);
      });

      return {
        topUnits: Object.entries(unitAreas)
          .sort(([, a], [, b]) => b - a)
          .map(([unit]) => unit),
        variantUnits: Object.entries(unitVariations)
          .sort(([, a], [, b]) => b - a)
          .map(([unit]) => unit),
        variantCompetencies: Object.entries(competencyVariations)
          .sort(([, a], [, b]) => b - a)
          .map(([comp]) => comp)
      };
    };

    const metrics = calculateMetrics();

    return (
      <div className="bg-white h-full overflow-auto">
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Performing Units Based on Area Covered</h3>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left font-medium text-gray-600 p-4 w-24">Rank</th>
                    <th className="text-left font-medium text-gray-600 p-4">Unit Name</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topUnits.map((unit, index) => (
                    <tr key={unit} className="border-t">
                      <td className="p-4 text-gray-900">{index + 1}</td>
                      <td className="p-4 text-gray-900">{unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Units with Significant Variations</h3>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left font-medium text-gray-600 p-4 w-24">Rank</th>
                    <th className="text-left font-medium text-gray-600 p-4">Unit Name</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.variantUnits.map((unit, index) => (
                    <tr key={unit} className="border-t">
                      <td className="p-4 text-gray-900">{index + 1}</td>
                      <td className="p-4 text-gray-900">{unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Competencies with Widest Variance</h3>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left font-medium text-gray-600 p-4 w-24">Rank</th>
                    <th className="text-left font-medium text-gray-600 p-4">Competency</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.variantCompetencies.map((comp, index) => (
                    <tr key={comp} className="border-t">
                      <td className="p-4 text-gray-900">{index + 1}</td>
                      <td className="p-4 text-gray-900">{comp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleMainCompetencyChange = (value) => {
    setSelectedMainCompetency(value)
  }

  const allUnits = useMemo(() => {
    if (!unitsByRegion) return [];
    const units = [];
    Object.values(unitsByRegion).forEach(regionUnits => {
      regionUnits.forEach(unit => {
        if (!units.some(u => u.value === unit.value)) {
          units.push(unit);
        }
      });
    });
    return units;
  }, [unitsByRegion]);

  const availableUnits = useMemo(() => {
    if (!unitsByRegion || Object.keys(unitsByRegion).length === 0) return [];
    if (!selectedRegions || selectedRegions.length === 0) return allUnits;
    
    const units = [];
    selectedRegions.forEach(regionValue => {
      const regionUnits = unitsByRegion[regionValue] || [];
      regionUnits.forEach(unit => {
        if (!units.some(u => u.value === unit.value)) {
          units.push(unit);
        }
      });
    });
    return units;
  }, [selectedRegions, unitsByRegion, allUnits]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Radar Chart View</CardTitle>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="competency">Main Competencies</TabsTrigger>
                <TabsTrigger value="subcompetency">Sub-Competencies</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {viewMode === "subcompetency" && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="main-competency">Select Main Competency:</Label>
              <Select value={selectedMainCompetency} onValueChange={handleMainCompetencyChange}>
                <SelectTrigger id="main-competency" className="w-[200px]">
                  <SelectValue placeholder="Select a competency" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCompetencies.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Label htmlFor="chart-type">Chart Type:</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger id="chart-type" className="w-[150px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <Tabs value={activeView} onValueChange={setActiveView} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart View</TabsTrigger>
                <TabsTrigger value="analytics">Analytics View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[600px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : activeView === "chart" ? (
          selectedUnits && selectedUnits.length > 0 ? (
            data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 10]} 
                    tickCount={6}
                  />
                  {selectedUnits.map((unit, index) => (
                    <Radar
                      key={unit}
                      name={unit}
                      dataKey={unit}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={chartType === "area" ? 0.6 : 0}
                      strokeWidth={chartType === "line" ? 2 : 1}
                    />
                  ))}
                  <Legend />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
                            <p className="font-medium">{`${label}`}</p>
                            {payload.map((entry, index) => (
                              <p key={`item-${index}`} style={{ color: entry.color }}>
                                {`${entry.name}: ${entry.value}`}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  {viewMode === "subcompetency" 
                    ? "Please select a competency to view sub-competencies" 
                    : "No data available for the selected units"}
                </p>
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Select at least one unit to view the radar chart</p>
            </div>
          )
        ) : (
          renderAnalyticsView()
        )}
      </CardContent>
    </Card>
  )
} 