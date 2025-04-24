import React, { useState, useEffect } from "react"
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
import { mainCompetencies, subCompetenciesMap } from "../../data/sampleData"
import { CustomTooltip } from "./CustomTooltip"
import { toast } from "react-hot-toast"
const BASE_URL = import.meta.env.VITE_API_URL;

export function RadarChartView({ selectedRegions, selectedUnits }) {
  const [selectedCompetencies, setSelectedCompetencies] = useState(mainCompetencies)
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState([])
  const [chartType, setChartType] = useState("line")
  const [activeView, setActiveView] = useState("chart")
  const [viewMode, setViewMode] = useState("competency")
  const [selectedMainCompetency, setSelectedMainCompetency] = useState("")
  const [apiData, setApiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRadarData = async () => {
      if (!selectedUnits || selectedUnits.length === 0) return

      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${BASE_URL}reportanalytics/getRadarChartMainCompetency`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            unit: selectedUnits
          })
        })

        const data = await response.json();
        console.log(data);
        if (data.status === "success") {
          setApiData(data.data)
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

  const generateData = (apiData, selectedUnits) => {
    if (!apiData || !apiData.section_detail || !apiData.unit_details) return []
    
    if (viewMode === "competency") {
      // Log all available section names from API
      console.log('Available sections from API:', Object.values(apiData.section_detail).map(section => section.section_name))
      
      const competencies = Object.values(apiData.section_detail).map(section => section.section_name)
      return competencies.map(comp => {
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
              const originalValue = unitData[sectionId].unit_section_score_average
              let calculatedValue

              // Log the exact section name being processed
              console.log('Processing section:', comp)

              // Apply different formulas based on section type
              switch (comp) {
                case 'Leadership':
                  calculatedValue = (originalValue / 36) * 10
                  break
                case 'Situation Management':
                  calculatedValue = (originalValue / 42) * 10
                  break
                case 'Quality in Healthcare Delivery':
                  calculatedValue = (originalValue / 48) * 10
                  break
                case 'Relationship Building':
                  calculatedValue = (originalValue / 54) * 10
                  break
                default:
                  calculatedValue = originalValue
              }

              // Log both original and calculated values with more detail
              console.log(`Unit: ${unit}, Section: ${comp}`)
              console.log(`Original Value: ${originalValue}`)
              console.log(`Calculation: (${originalValue} / ${comp === 'Leadership' ? 36 : comp === 'Situation Management' ? 42 : comp === 'Quality in Healthcare' ? 48 : 54}) * 10`)
              console.log(`Calculated Value (scale of 10): ${calculatedValue}`)
              console.log('-------------------')

              dataPoint[unit] = calculatedValue
            }
          }
        })
        return dataPoint
      })
    } else {
      if (!selectedMainCompetency) return []
      
      const subCompetencies = subCompetenciesMap[selectedMainCompetency] || []
      return subCompetencies.map(sub => {
        const dataPoint = {
          subject: sub,
        }
        selectedUnits.forEach((unit) => {
          dataPoint[unit] = Math.random() * 10 // Scale sub-competency data to 10 as well
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
                    <th className="text-left font-medium text-gray-600 p-4">Competencies</th>
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
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Radar Chart View</CardTitle>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Tabs value={chartType} onValueChange={setChartType} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="line">Radar Line Chart</TabsTrigger>
                <TabsTrigger value="area">Radar Area Chart</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center space-x-2">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="competency">Competency View</TabsTrigger>
                <TabsTrigger value="sub-competency">Sub-Competency View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {viewMode === "sub-competency" && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="competencies-radar">Competency:</Label>
              <Select value={selectedMainCompetency} onValueChange={setSelectedMainCompetency}>
                <SelectTrigger id="competencies-radar" className="w-[200px]">
                  <SelectValue placeholder="Select competency" />
                </SelectTrigger>
                <SelectContent>
                  {mainCompetencies.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
        {activeView === "chart" ? (
          selectedUnits && selectedUnits.length > 0 ? (
            data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={250} data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={0} domain={[0, 10]} tickCount={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tickCount={11} />
                  <PolarRadiusAxis angle={180} domain={[0, 10]} tickCount={11} />
                  <PolarRadiusAxis angle={270} domain={[0, 10]} tickCount={11} />
                  {selectedUnits.map((unit, index) => (
                    <Radar
                      key={unit}
                      name={unit}
                      dataKey={unit}
                      stroke={colors[index % colors.length]}
                      fill={chartType === "area" ? colors[index % colors.length] : "none"}
                      fillOpacity={0.6}
                      dot={true}
                      strokeWidth={3}
                    />
                  ))}
                  <Legend />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  {viewMode === "sub-competency" 
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