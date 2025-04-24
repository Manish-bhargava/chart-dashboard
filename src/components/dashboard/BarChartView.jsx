import React, { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Label } from "../ui/label"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"
import { mainCompetencies, subCompetenciesMap, barData, subBarDataLeadership } from "../../data/sampleData"
import { CustomTooltip } from "./CustomTooltip"
import { SimpleMultiSelect } from "./SimpleMultiSelect"
import { Button } from "../ui/button"
import { Maximize2, Minimize2 } from "lucide-react"

const calculateScore = (value, competency) => {
  let calculatedValue;
  
  switch (competency) {
    case 'Leadership':
      calculatedValue = (value / 36) * 10;
      break;
    case 'Situation Management':
      calculatedValue = (value / 42) * 10;
      break;
    case 'Quality in Healthcare Delivery':
      calculatedValue = (value / 48) * 10;
      break;
    case 'Relationship Building':
      calculatedValue = (value / 54) * 10;
      break;
    default:
      calculatedValue = value;
  }

  // Log the calculation for debugging
  console.log(`Bar Chart - Competency: ${competency}`);
  console.log(`Original Value: ${value}`);
  console.log(`Calculation: (${value} / ${competency === 'Leadership' ? 36 : competency === 'Situation Management' ? 42 : competency === 'Quality in Healthcare Delivery' ? 48 : 54}) * 10`);
  console.log(`Calculated Value (scale of 10): ${calculatedValue}`);
  console.log('-------------------');

  return calculatedValue;
};

export function BarChartView({ selectedRegions, selectedUnits }) {
  const [selectedCompetencies, setSelectedCompetencies] = useState([])
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState([])
  const [viewMode, setViewMode] = useState("competency") // "competency" or "sub-competency"
  const [displayMode, setDisplayMode] = useState("chart") // "chart" or "analytics"
  const [isZoomed, setIsZoomed] = useState(false)

  const filteredData = barData.filter(item => 
    selectedRegions.includes(item.region) && 
    selectedUnits.includes(item.unit)
  );

  const subFilteredData = subBarDataLeadership.filter(item => 
    selectedRegions.includes(item.region) && 
    selectedUnits.includes(item.unit)
  );

  const calculateAverage = (data, field) => {
    const sum = data.reduce((acc, item) => acc + calculateScore(item[field], field), 0);
    return sum / data.length;
  };

  const calculateSubAverage = (data, field) => {
    const sum = data.reduce((acc, item) => acc + calculateScore(item[field], 'Leadership'), 0);
    return sum / data.length;
  };

  // Choose data based on selected competencies and view mode
  let data = viewMode === "competency" 
    ? filteredData 
    : subFilteredData

  let dataKeys = []

  if (viewMode === "sub-competency") {
    dataKeys = selectedSubCompetencies
      .map((sc) => {
        const keyMap = {
          // Leadership sub-competencies
          "Mentoring": "Mentoring",
          "Taking Initiative": "Initiative",
          "Conflict Management": "ConflictManagement",
          "Ambition": "Ambition",
          // Situation Management sub-competencies
          "Crisis Response": "CrisisResponse",
          "Decision Making": "DecisionMaking",
          "Resource Allocation": "ResourceAllocation",
          "Stress Management": "StressManagement",
          // Quality of Healthcare sub-competencies
          "Patient Safety": "PatientSafety",
          "Protocol Adherence": "ProtocolAdherence",
          "Documentation": "Documentation",
          "Continuous Improvement": "ContinuousImprovement",
          // Relationship Building sub-competencies
          "Patient Communication": "PatientCommunication",
          "Team Collaboration": "TeamCollaboration",
          "Conflict Resolution": "ConflictResolution",
          "Empathy": "Empathy"
        }
        return keyMap[sc]
      })
      .filter(Boolean)
  } else {
    dataKeys = selectedCompetencies
      .map((c) => {
        const keyMap = {
          "Leadership": "Leadership",
          "Situation Management": "SituationManagement",
          "Quality of Healthcare": "QualityOfHealthcare",
          "Relationship Building": "RelationshipBuilding"
        }
        return keyMap[c]
      })
      .filter(Boolean)
  }

  // Calculate analytics data
  const calculateAnalytics = () => {
    if (!data.length || !dataKeys.length) return null

    const analytics = []

    dataKeys.forEach(key => {
      const values = data.map(item => item[key])
      const maxValue = Math.max(...values)
      const maxUnit = data.find(item => item[key] === maxValue)

      analytics.push({
        competency: key.replace(/([A-Z])/g, " $1").trim(),
        bestUnit: maxUnit.name,
        score: maxValue
      })
    })

    return analytics.sort((a, b) => b.score - a.score)
  }

  const analytics = calculateAnalytics()

  // Colors for bars - distinct colors for each sub-competency
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", 
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#a4de6c", "#d0ed57", "#ffc658", "#8dd1e1",
    "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c",
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"
  ]

  return (
    <Card className={`h-full ${isZoomed ? 'fixed inset-0 z-50 m-4' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Bar Charts - Unit Performance</CardTitle>
            <CardDescription>
              {viewMode === "sub-competency"
                ? "Comparison of sub-competencies across selected units"
                : "Comparison of main competencies across selected units"}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsZoomed(!isZoomed)}
            className="ml-2"
          >
            {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          {viewMode === "competency" ? (
            <div className="flex items-center space-x-2">
              <Label htmlFor="competency-select-bar">Main Competencies:</Label>
              <SimpleMultiSelect
                options={mainCompetencies}
                value={selectedCompetencies}
                onChange={setSelectedCompetencies}
                placeholder="Select Main Competencies"
                showCheckAll={true}
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Label htmlFor="sub-competency-select-bar">Sub-Competencies:</Label>
              <SimpleMultiSelect
                options={Object.values(subCompetenciesMap).flat()}
                value={selectedSubCompetencies}
                onChange={setSelectedSubCompetencies}
                placeholder="Select Sub-Competencies"
                showCheckAll={true}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="competency">Competency View</TabsTrigger>
                <TabsTrigger value="sub-competency">Sub-Competency View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center space-x-2">
            <Tabs value={displayMode} onValueChange={setDisplayMode} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart View</TabsTrigger>
                <TabsTrigger value="analytics">Analytics View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`${isZoomed ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}>
        {selectedUnits.length > 0 && dataKeys.length > 0 ? (
          displayMode === "chart" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                  dataKey="name" 
                  label={{ value: "Units", position: "insideBottom", offset: -5 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis 
                  label={{ value: "Score", angle: -90, position: "insideLeft" }} 
                  domain={[0, 150]} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />

                {dataKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[index]}
                    name={key.replace(/([A-Z])/g, " $1").trim()}
                  >
                    <LabelList dataKey={key} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full overflow-auto p-6">
              <h2 className="text-2xl font-semibold mb-6">Top Performers</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[400px]">Competency</TableHead>
                    <TableHead className="w-[400px]">Best Unit</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((item) => (
                    <TableRow key={item.competency}>
                      <TableCell className="font-medium">{item.competency}</TableCell>
                      <TableCell>{item.bestUnit}</TableCell>
                      <TableCell className="text-right">{item.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              {selectedUnits.length === 0
                ? "Please select at least one unit to view the chart"
                : "Please select at least one competency to view the chart"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 