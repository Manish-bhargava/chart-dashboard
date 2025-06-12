// import React, { useState } from "react"
// import {
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Radar,
//   Legend,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts"

// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { MultiSelect } from "./MultiSelect"
// import { CustomTooltip } from "./CustomTooltip"
// import {
//   competencyData,
//   subCompetencyLeadership,
//   subCompetencySituation,
//   subCompetencyQuality,
//   subCompetencyRelationship,
//   mainCompetencies,
//   subCompetenciesMap,
// } from "@/data/sampleData"
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = [
  '#2ecc71', '#9b59b6', '#1abc9c', '#3498db', '#f1c40f',
  '#e74c3c', '#16a085', '#27ae60', '#2980b9', '#8e44ad',
  '#2c3e50', '#f39c12', '#d35400', '#1abc9c', '#22313f',
  '#4CAF50', '#03A9F4', '#FF9800', '#8BC34A', '#2196F3',
  '#009688', '#FFC107', '#FF69B4', '#8E24AA', '#4CAF50'
];

// export function RadarChartView({ selectedRegions, selectedUnits }) {
//   const [selectedCompetencies, setSelectedCompetencies] = useState(["Leadership"])
//   const [selectedSubCompetencies, setSelectedSubCompetencies] = useState([])
//   const [viewMode, setViewMode] = useState("absolute")

//   // Choose data based on selected competencies
//   let data
//   if (selectedSubCompetencies.length > 0) {
//     // Show sub-competency data
//     if (selectedCompetencies.includes("Leadership")) {
//       data = subCompetencyLeadership
//     } else if (selectedCompetencies.includes("Situation Management")) {
//       data = subCompetencySituation
//     } else if (selectedCompetencies.includes("Quality of Healthcare")) {
//       data = subCompetencyQuality
//     } else if (selectedCompetencies.includes("Relationship Building")) {
//       data = subCompetencyRelationship
//     } else {
//       data = subCompetencyLeadership
//     }
//   } else {
//     // Show main competency data
//     data = competencyData
//   }

//   return (
//     <Card className="h-full">
//       <CardHeader>
//         <CardTitle>Radar Chart - Competency Overview</CardTitle>
//         <CardDescription>
//           {selectedSubCompetencies.length > 0
//             ? `Drill down into ${selectedCompetencies[0]} sub-competencies`
//             : "Comparison of main competencies across units"}
//         </CardDescription>

//         <div className="flex flex-wrap gap-4 mt-2">
//           <div className="flex items-center space-x-2">
//             <Label htmlFor="competency-select">Competency:</Label>
//             <MultiSelect
//               options={mainCompetencies}
//               value={selectedCompetencies}
//               onChange={setSelectedCompetencies}
//               placeholder="Select Competencies"
//               showCheckAll={true}
//             />
//           </div>

//           {selectedCompetencies.length === 1 && (
//             <div className="flex items-center space-x-2">
//               <Label htmlFor="sub-competency-select">Sub-Competency:</Label>
//               <MultiSelect
//                 options={subCompetenciesMap[selectedCompetencies[0]] || []}
//                 value={selectedSubCompetencies}
//                 onChange={setSelectedSubCompetencies}
//                 placeholder="Select Sub-Competencies"
//                 showCheckAll={true}
//               />
//             </div>
//           )}

//           <div className="flex items-center space-x-2">
//             <Label htmlFor="view-mode-radar">View Mode:</Label>
//             <Select value={viewMode} onValueChange={setViewMode}>
//               <SelectTrigger id="view-mode-radar" className="w-[180px]">
//                 <SelectValue placeholder="Select view" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="absolute">Absolute Score</SelectItem>
//                 <SelectItem value="percentile">Percentile Score</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="h-[400px]">
//         {selectedUnits.length > 0 ? (
//           <ResponsiveContainer width="100%" height="100%">
//             <RadarChart outerRadius={150} data={data}>
//               <PolarGrid />
//               <PolarAngleAxis dataKey="subject" />
//               <PolarRadiusAxis angle={30} domain={[0, 150]} label={{ position: "outside", fill: "#666" }} />
//               <Radar name="Unit A" dataKey="A" stroke="#8884d8" fill="none" dot={true} strokeWidth={3} />
//               <Radar name="Unit B" dataKey="B" stroke="#82ca9d" fill="none" dot={true} strokeWidth={3} />
//               <Radar name="Unit C" dataKey="C" stroke="#ffc658" fill="none" dot={true} strokeWidth={3} />
//               <Radar name="Unit D" dataKey="D" stroke="#ff8042" fill="none" dot={true} strokeWidth={3} />
//               <Legend />
//               <Tooltip content={<CustomTooltip />} />
//             </RadarChart>
//           </ResponsiveContainer>
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-muted-foreground">Please select at least one unit to view the chart</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// } 