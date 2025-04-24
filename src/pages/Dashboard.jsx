"use client"
const BASE_URL = import.meta.env.VITE_API_URL;

import React, { useState, useEffect, useMemo } from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  AreaChart,
  Area,
  LabelList,
} from "recharts"
import { Activity, BarChart2, PieChart, Map, Circle, ChevronDown, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command"
import { Badge } from "../components/ui/badge"
import { ScrollArea } from "../components/ui/scroll-area"
import { Checkbox } from "../components/ui/checkbox"
import { Calendar } from "../components/ui/calendar"
import { Input } from "../components/ui/input"

import { SidebarProvider } from "../components/sidebar/sidebar-provider"
import { Sidebar } from "../components/sidebar/sidebar"
import { SidebarHeader } from "../components/sidebar/sidebar-header"
import { SidebarContent } from "../components/sidebar/sidebar-content"
import { SidebarFooter } from "../components/sidebar/sidebar-footer"
import { SidebarTrigger } from "../components/sidebar/sidebar-trigger"
import { SidebarMenu } from "../components/sidebar/sidebar-menu"
import { SidebarMenuItem } from "../components/sidebar/sidebar-menu-item"
import { SidebarMenuButton } from "../components/sidebar/sidebar-menu-button"
import { SidebarGroup } from "../components/sidebar/sidebar-group"
import { SidebarGroupLabel } from "../components/sidebar/sidebar-group-label"
import { SidebarGroupContent } from "../components/sidebar/sidebar-group-content"
import { regions, units, departments, mainCompetencies, subCompetenciesMap } from "../data/sampleData"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { SimpleMultiSelect } from "../components/dashboard/SimpleMultiSelect"
import { RadarChartView } from "../components/dashboard/RadarChartView"
import { BarChartView } from "../components/dashboard/BarChartView"
import { HeatMapChart } from "../components/dashboard/HeatMapChart"
import { TalentDistributionMap } from "../components/dashboard/TalentDistributionMap"
import { BubbleMatrixPlot } from "../components/dashboard/BubbleMatrixPlot"
// Sample data
const competencyData = [
  { subject: "Leadership", A: 120, B: 110, C: 140, D: 90, fullMark: 150 },
  { subject: "Situation Management", A: 98, B: 130, C: 110, D: 100, fullMark: 150 },
  { subject: "Quality of Healthcare", A: 86, B: 130, C: 70, D: 120, fullMark: 150 },
  { subject: "Relationship Building", A: 99, B: 100, C: 120, D: 110, fullMark: 150 },
]

const subCompetencyLeadership = [
  { subject: "Mentoring", A: 110, B: 90, C: 120, D: 85, fullMark: 150 },
  { subject: "Taking Initiative", A: 130, B: 100, C: 130, D: 95, fullMark: 150 },
  { subject: "Conflict Management", A: 90, B: 120, C: 100, D: 110, fullMark: 150 },
  { subject: "Ambition", A: 105, B: 95, C: 125, D: 100, fullMark: 150 },
]

const subCompetencySituation = [
  { subject: "Crisis Response", A: 95, B: 125, C: 105, D: 90, fullMark: 150 },
  { subject: "Decision Making", A: 100, B: 135, C: 115, D: 105, fullMark: 150 },
  { subject: "Resource Allocation", A: 105, B: 130, C: 100, D: 95, fullMark: 150 },
  { subject: "Stress Management", A: 90, B: 125, C: 120, D: 110, fullMark: 150 },
]

const subCompetencyQuality = [
  { subject: "Patient Safety", A: 90, B: 135, C: 75, D: 125, fullMark: 150 },
  { subject: "Protocol Adherence", A: 85, B: 130, C: 70, D: 120, fullMark: 150 },
  { subject: "Documentation", A: 80, B: 125, C: 65, D: 115, fullMark: 150 },
  { subject: "Continuous Improvement", A: 90, B: 130, C: 75, D: 120, fullMark: 150 },
]

const subCompetencyRelationship = [
  { subject: "Patient Communication", A: 105, B: 95, C: 125, D: 115, fullMark: 150 },
  { subject: "Team Collaboration", A: 100, B: 105, C: 120, D: 110, fullMark: 150 },
  { subject: "Conflict Resolution", A: 95, B: 100, C: 115, D: 105, fullMark: 150 },
  { subject: "Empathy", A: 95, B: 100, C: 120, D: 110, fullMark: 150 },
]

const barData = [
  { name: "New Delhi", Leadership: 120, SituationManagement: 98, QualityOfHealthcare: 86, RelationshipBuilding: 99 },
  { name: "Jaipur", Leadership: 110, SituationManagement: 130, QualityOfHealthcare: 130, RelationshipBuilding: 100 },
  { name: "Patiala", Leadership: 140, SituationManagement: 110, QualityOfHealthcare: 70, RelationshipBuilding: 120 },
  { name: "Salt Lake", Leadership: 90, SituationManagement: 100, QualityOfHealthcare: 120, RelationshipBuilding: 110 },
  { name: "Gurugram", Leadership: 105, SituationManagement: 115, QualityOfHealthcare: 95, RelationshipBuilding: 105 },
  { name: "Ghaziabad", Leadership: 95, SituationManagement: 125, QualityOfHealthcare: 85, RelationshipBuilding: 115 },
  { name: "Bengaluru", Leadership: 115, SituationManagement: 105, QualityOfHealthcare: 105, RelationshipBuilding: 95 },
  { name: "Jayanagar", Leadership: 100, SituationManagement: 110, QualityOfHealthcare: 90, RelationshipBuilding: 110 },
  { name: "Baner Pune", Leadership: 110, SituationManagement: 100, QualityOfHealthcare: 100, RelationshipBuilding: 100 },
  { name: "Mangalore", Leadership: 105, SituationManagement: 95, QualityOfHealthcare: 95, RelationshipBuilding: 105 },
  { name: "Panaji", Leadership: 95, SituationManagement: 105, QualityOfHealthcare: 105, RelationshipBuilding: 95 },
  { name: "Vijayawada", Leadership: 100, SituationManagement: 100, QualityOfHealthcare: 100, RelationshipBuilding: 100 },
  { name: "Salem", Leadership: 115, SituationManagement: 105, QualityOfHealthcare: 105, RelationshipBuilding: 95 },
  { name: "Mysuru", Leadership: 105, SituationManagement: 115, QualityOfHealthcare: 95, RelationshipBuilding: 105 },
  { name: "Pune", Leadership: 110, SituationManagement: 110, QualityOfHealthcare: 110, RelationshipBuilding: 90 }
]

const subBarDataLeadership = [
  { 
    name: "New Delhi", 
    Mentoring: 110, Initiative: 130, ConflictManagement: 90, Ambition: 105,
    CrisisResponse: 95, DecisionMaking: 100, ResourceAllocation: 105, StressManagement: 90,
    PatientSafety: 90, ProtocolAdherence: 85, Documentation: 80, ContinuousImprovement: 90,
    PatientCommunication: 105, TeamCollaboration: 100, ConflictResolution: 95, Empathy: 95
  },
  { 
    name: "Jaipur", 
    Mentoring: 90, Initiative: 100, ConflictManagement: 120, Ambition: 95,
    CrisisResponse: 125, DecisionMaking: 135, ResourceAllocation: 130, StressManagement: 125,
    PatientSafety: 135, ProtocolAdherence: 130, Documentation: 125, ContinuousImprovement: 130,
    PatientCommunication: 95, TeamCollaboration: 105, ConflictResolution: 100, Empathy: 100
  },
  { 
    name: "Patiala", 
    Mentoring: 120, Initiative: 130, ConflictManagement: 100, Ambition: 125,
    CrisisResponse: 105, DecisionMaking: 115, ResourceAllocation: 100, StressManagement: 120,
    PatientSafety: 75, ProtocolAdherence: 70, Documentation: 65, ContinuousImprovement: 75,
    PatientCommunication: 125, TeamCollaboration: 120, ConflictResolution: 115, Empathy: 120
  },
  { name: "Salt Lake", Mentoring: 85, Initiative: 95, ConflictManagement: 110, Ambition: 100 },
  { name: "Gurugram", Mentoring: 95, Initiative: 110, ConflictManagement: 105, Ambition: 115 },
  { name: "Ghaziabad", Mentoring: 100, Initiative: 120, ConflictManagement: 95, Ambition: 110 },
  { name: "Bengaluru", Mentoring: 115, Initiative: 125, ConflictManagement: 85, Ambition: 105 },
  { name: "Jayanagar", Mentoring: 105, Initiative: 115, ConflictManagement: 95, Ambition: 100 },
  { name: "Baner Pune", Mentoring: 110, Initiative: 120, ConflictManagement: 90, Ambition: 115 },
  { name: "Mangalore", Mentoring: 95, Initiative: 105, ConflictManagement: 100, Ambition: 95 },
  { name: "Panaji", Mentoring: 100, Initiative: 110, ConflictManagement: 105, Ambition: 90 },
  { name: "Vijayawada", Mentoring: 90, Initiative: 100, ConflictManagement: 110, Ambition: 105 },
  { name: "Salem", Mentoring: 105, Initiative: 115, ConflictManagement: 95, Ambition: 110 },
  { name: "Mysuru", Mentoring: 100, Initiative: 110, ConflictManagement: 100, Ambition: 105 },
  { name: "Pune", Mentoring: 110, Initiative: 120, ConflictManagement: 95, Ambition: 100 }
]

const subBarDataSituation = [
  { name: "Unit A", CrisisResponse: 95, DecisionMaking: 100, ResourceAllocation: 105, StressManagement: 90 },
  { name: "Unit B", CrisisResponse: 125, DecisionMaking: 135, ResourceAllocation: 130, StressManagement: 125 },
  { name: "Unit C", CrisisResponse: 105, DecisionMaking: 115, ResourceAllocation: 100, StressManagement: 120 },
  { name: "Unit D", CrisisResponse: 90, DecisionMaking: 105, ResourceAllocation: 95, StressManagement: 110 },
  { name: "Unit E", CrisisResponse: 110, DecisionMaking: 120, ResourceAllocation: 115, StressManagement: 105 },
]

const heatMapData = [
  { unit: "Delhi", Leadership: 80, SituationManagement: 65, QualityOfHealthcare: 72, RelationshipBuilding: 88 },
  { unit: "Chandigarh", Leadership: 75, SituationManagement: 82, QualityOfHealthcare: 91, RelationshipBuilding: 70 },
  { unit: "Lucknow", Leadership: 92, SituationManagement: 78, QualityOfHealthcare: 53, RelationshipBuilding: 85 },
  { unit: "Jaipur", Leadership: 68, SituationManagement: 71, QualityOfHealthcare: 84, RelationshipBuilding: 79 },
  { unit: "Bangalore", Leadership: 88, SituationManagement: 75, QualityOfHealthcare: 90, RelationshipBuilding: 72 },
  { unit: "Chennai", Leadership: 82, SituationManagement: 78, QualityOfHealthcare: 85, RelationshipBuilding: 75 },
  { unit: "Hyderabad", Leadership: 85, SituationManagement: 80, QualityOfHealthcare: 88, RelationshipBuilding: 82 },
  { unit: "Kochi", Leadership: 78, SituationManagement: 82, QualityOfHealthcare: 75, RelationshipBuilding: 85 },
  { unit: "Kolkata", Leadership: 85, SituationManagement: 75, QualityOfHealthcare: 80, RelationshipBuilding: 85 },
  { unit: "Bhubaneswar", Leadership: 80, SituationManagement: 70, QualityOfHealthcare: 75, RelationshipBuilding: 80 },
  { unit: "Guwahati", Leadership: 75, SituationManagement: 80, QualityOfHealthcare: 85, RelationshipBuilding: 75 },
  { unit: "Patna", Leadership: 80, SituationManagement: 75, QualityOfHealthcare: 80, RelationshipBuilding: 80 },
  { unit: "Mumbai", Leadership: 90, SituationManagement: 85, QualityOfHealthcare: 88, RelationshipBuilding: 82 },
  { unit: "Ahmedabad", Leadership: 85, SituationManagement: 90, QualityOfHealthcare: 75, RelationshipBuilding: 85 },
  { unit: "Pune", Leadership: 88, SituationManagement: 88, QualityOfHealthcare: 88, RelationshipBuilding: 70 },
  { unit: "Nagpur", Leadership: 80, SituationManagement: 80, QualityOfHealthcare: 80, RelationshipBuilding: 80 }
]

const heatMapPercentileData = [
  { unit: "Delhi", Leadership: 75, SituationManagement: 60, QualityOfHealthcare: 68, RelationshipBuilding: 82 },
  { unit: "Chandigarh", Leadership: 70, SituationManagement: 78, QualityOfHealthcare: 88, RelationshipBuilding: 65 },
  { unit: "Lucknow", Leadership: 90, SituationManagement: 73, QualityOfHealthcare: 48, RelationshipBuilding: 80 },
  { unit: "Jaipur", Leadership: 63, SituationManagement: 67, QualityOfHealthcare: 79, RelationshipBuilding: 74 },
  { unit: "Bangalore", Leadership: 83, SituationManagement: 70, QualityOfHealthcare: 85, RelationshipBuilding: 67 },
  { unit: "Chennai", Leadership: 77, SituationManagement: 73, QualityOfHealthcare: 80, RelationshipBuilding: 70 },
  { unit: "Hyderabad", Leadership: 80, SituationManagement: 75, QualityOfHealthcare: 83, RelationshipBuilding: 77 },
  { unit: "Kochi", Leadership: 73, SituationManagement: 77, QualityOfHealthcare: 70, RelationshipBuilding: 80 },
  { unit: "Kolkata", Leadership: 80, SituationManagement: 70, QualityOfHealthcare: 75, RelationshipBuilding: 80 },
  { unit: "Bhubaneswar", Leadership: 75, SituationManagement: 65, QualityOfHealthcare: 70, RelationshipBuilding: 75 },
  { unit: "Guwahati", Leadership: 70, SituationManagement: 75, QualityOfHealthcare: 80, RelationshipBuilding: 70 },
  { unit: "Patna", Leadership: 75, SituationManagement: 70, QualityOfHealthcare: 75, RelationshipBuilding: 75 },
  { unit: "Mumbai", Leadership: 85, SituationManagement: 80, QualityOfHealthcare: 83, RelationshipBuilding: 77 },
  { unit: "Ahmedabad", Leadership: 80, SituationManagement: 85, QualityOfHealthcare: 70, RelationshipBuilding: 80 },
  { unit: "Pune", Leadership: 83, SituationManagement: 83, QualityOfHealthcare: 83, RelationshipBuilding: 65 },
  { unit: "Nagpur", Leadership: 75, SituationManagement: 75, QualityOfHealthcare: 75, RelationshipBuilding: 75 }
]

const talentDistributionUnitData = [
  { score: 50, "Delhi": 5, "Chandigarh": 8, "Lucknow": 3, "Jaipur": 6, "Bangalore": 4 },
  { score: 60, "Delhi": 10, "Chandigarh": 12, "Lucknow": 8, "Jaipur": 9, "Bangalore": 11 },
  { score: 70, "Delhi": 15, "Chandigarh": 10, "Lucknow": 12, "Jaipur": 14, "Bangalore": 13 },
  { score: 80, "Delhi": 20, "Chandigarh": 15, "Lucknow": 18, "Jaipur": 16, "Bangalore": 17 },
  { score: 90, "Delhi": 12, "Chandigarh": 8, "Lucknow": 15, "Jaipur": 10, "Bangalore": 9 },
  { score: 100, "Delhi": 5, "Chandigarh": 3, "Lucknow": 7, "Jaipur": 4, "Bangalore": 5 }
]

const talentDistributionDeptData = [
  { score: 50, Nursing: 4, Administration: 7, Emergency: 3, Surgery: 5, ICU: 6 },
  { score: 60, Nursing: 8, Administration: 10, Emergency: 7, Surgery: 9, ICU: 8 },
  { score: 70, Nursing: 14, Administration: 12, Emergency: 10, Surgery: 13, ICU: 11 },
  { score: 80, Nursing: 18, Administration: 14, Emergency: 16, Surgery: 15, ICU: 17 },
  { score: 90, Nursing: 10, Administration: 7, Emergency: 12, Surgery: 9, ICU: 11 },
  { score: 100, Nursing: 4, Administration: 3, Emergency: 6, Surgery: 3, ICU: 5 },
]

const bubbleData = [
  // North Region
  { x: 1, y: 1, z: 80, count: 25, name: "Delhi", competency: "Leadership" },
  { x: 1, y: 2, z: 65, count: 18, name: "Delhi", competency: "Situation Management" },
  { x: 1, y: 3, z: 72, count: 22, name: "Delhi", competency: "Quality of Healthcare" },
  { x: 1, y: 4, z: 88, count: 30, name: "Delhi", competency: "Relationship Building" },

  { x: 2, y: 1, z: 75, count: 20, name: "Chandigarh", competency: "Leadership" },
  { x: 2, y: 2, z: 82, count: 28, name: "Chandigarh", competency: "Situation Management" },
  { x: 2, y: 3, z: 91, count: 35, name: "Chandigarh", competency: "Quality of Healthcare" },
  { x: 2, y: 4, z: 70, count: 15, name: "Chandigarh", competency: "Relationship Building" },

  { x: 3, y: 1, z: 92, count: 40, name: "Lucknow", competency: "Leadership" },
  { x: 3, y: 2, z: 78, count: 25, name: "Lucknow", competency: "Situation Management" },
  { x: 3, y: 3, z: 53, count: 12, name: "Lucknow", competency: "Quality of Healthcare" },
  { x: 3, y: 4, z: 85, count: 32, name: "Lucknow", competency: "Relationship Building" },

  { x: 4, y: 1, z: 68, count: 22, name: "Jaipur", competency: "Leadership" },
  { x: 4, y: 2, z: 71, count: 19, name: "Jaipur", competency: "Situation Management" },
  { x: 4, y: 3, z: 84, count: 28, name: "Jaipur", competency: "Quality of Healthcare" },
  { x: 4, y: 4, z: 79, count: 24, name: "Jaipur", competency: "Relationship Building" }
]

// Color scale for heat map
const getColorByValue = (value) => {
  if (value >= 90) return "#10b981" // Green
  if (value >= 80) return "#22c55e"
  if (value >= 70) return "#84cc16"
  if (value >= 60) return "#eab308" // Yellow
  if (value >= 50) return "#f59e0b"
  if (value >= 40) return "#f97316"
  return "#ef4444" // Red
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
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
    )
  }
  return null
}

// Main Dashboard Component
export default function Dashboard() {
  const [selectedRegions, setSelectedRegions] = useState([])
  const [selectedUnits, setSelectedUnits] = useState([])
  const [regions, setRegions] = useState([])
  const [unitsByRegion, setUnitsByRegion] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("radar")

  // Fetch regions and units data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem("token")
        const response = await fetch(`${BASE_URL}/reportanalytics/getUnitList`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({})
        })
   console.log("this is api url ",response);



        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.status === "success" && data.units) {
          // Extract regions from the units data
          const regionsList = Object.keys(data.units)
          setRegions(regionsList)
          setUnitsByRegion(data.units)
        } else {
          throw new Error("Invalid data format received")
        }
      } catch (error) {
        console.error("Error fetching units:", error)
        setError("Failed to load units data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get all available units
  const allUnits = useMemo(() => {
    const units = new Set()
    Object.values(unitsByRegion).forEach(regionUnits => {
      regionUnits.forEach(unit => units.add(unit))
    })
    return Array.from(units)
  }, [unitsByRegion])

  // Get filtered units based on selected regions
  const availableUnits = useMemo(() => {
    if (selectedRegions.length === 0) return allUnits
    return selectedRegions.flatMap(region => unitsByRegion[region] || [])
  }, [selectedRegions, unitsByRegion, allUnits])

  // Handle region selection
  const handleRegionChange = (selectedRegions) => {
    console.log("Selected regions:", selectedRegions)
    setSelectedRegions(selectedRegions)
    
    // If regions are selected, automatically select all units from those regions
    if (selectedRegions.length > 0) {
      const unitsFromSelectedRegions = selectedRegions.flatMap(region => unitsByRegion[region] || [])
      setSelectedUnits(unitsFromSelectedRegions)
    } else {
      // If no regions are selected, keep the current unit selection
      setSelectedUnits([])
    }
  }

  // Handle unit selection
  const handleUnitChange = (selectedUnits) => {
    console.log("Selected units:", selectedUnits)
    setSelectedUnits(selectedUnits)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar */}
        <Sidebar className="w-64 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white">
          <SidebarHeader className="border-b border-indigo-500">
            <div className="flex items-center p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-indigo-200" />
                <h1 className="text-xl font-bold text-white">Bodhi Labs</h1>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-indigo-200">Charts</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "radar"} 
                      onClick={() => setActiveTab("radar")}
                      className="hover:bg-indigo-500/50"
                    >
                      <Activity className="text-indigo-200" />
                      <span>Radar Chart</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "bar"} 
                      onClick={() => setActiveTab("bar")}
                      className="hover:bg-indigo-500/50"
                    >
                      <BarChart2 className="text-indigo-200" />
                      <span>Bar Charts</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "heat"} 
                      onClick={() => setActiveTab("heat")}
                      className="hover:bg-indigo-500/50"
                    >
                      <PieChart className="text-indigo-200" />
                      <span>Heat Map</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "talent"} 
                      onClick={() => setActiveTab("talent")}
                      className="hover:bg-indigo-500/50"
                    >
                      <Map className="text-indigo-200" />
                      <span>Talent Distribution</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "bubble"} 
                      onClick={() => setActiveTab("bubble")}
                      className="hover:bg-indigo-500/50"
                    >
                      <Circle className="text-indigo-200" />
                      <span>Bubble Plot</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-indigo-500 p-4">
            <div className="text-xs text-indigo-200">© 2025 Bodhi Labs</div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Common Filters */}
          <header className="bg-white border-b shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <SidebarTrigger className="text-indigo-600 hover:text-indigo-700" />
              <h1 className="text-xl font-bold text-indigo-600">Performance Dashboard</h1>
              <div className="w-8"></div>
            </div>

            {/* Common Filters - Region, Unit, and Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region-select" className="text-indigo-600">Region</Label>
                <SimpleMultiSelect
                  options={regions}
                  value={selectedRegions}
                  onChange={handleRegionChange}
                  placeholder="Select Regions"
                  showCheckAll={true}
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-select" className="text-indigo-600">Unit</Label>
                <SimpleMultiSelect
                  options={availableUnits}
                  value={selectedUnits}
                  onChange={handleUnitChange}
                  placeholder="Select Units"
                  showCheckAll={true}
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Chart Area - Takes full width */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg shadow-lg p-6 border border-indigo-100">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-indigo-700 mb-2">
                    {activeTab === "radar" && "Competency Radar Analysis"}
                    {activeTab === "bar" && "Performance Bar Charts"}
                    {activeTab === "heat" && "Performance Heat Map"}
                    {activeTab === "talent" && "Talent Distribution"}
                    {activeTab === "bubble" && "Bubble Matrix Analysis"}
                  </h2>
                  <p className="text-indigo-600">
                    {activeTab === "radar" && "Visual representation of competency scores across different units"}
                    {activeTab === "bar" && "Comparative analysis of performance metrics"}
                    {activeTab === "heat" && "Heat map showing performance distribution"}
                    {activeTab === "talent" && "Distribution of talent across different units"}
                    {activeTab === "bubble" && "Bubble plot showing multiple performance dimensions"}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-indigo-100">
                  {activeTab === "radar" && (
                    <RadarChartView selectedRegions={selectedRegions} selectedUnits={selectedUnits} />
                  )}
                  {activeTab === "bar" && (
                    <BarChartView selectedRegions={selectedRegions} selectedUnits={selectedUnits} />
                  )}
                  {activeTab === "heat" && (
                    <HeatMapChart selectedRegions={selectedRegions} selectedUnits={selectedUnits} />
                  )}
                  {activeTab === "talent" && (
                    <TalentDistributionMap selectedRegions={selectedRegions} selectedUnits={selectedUnits} />
                  )}
                  {activeTab === "bubble" && (
                    <BubbleMatrixPlot selectedRegions={selectedRegions} selectedUnits={selectedUnits} />
                  )}
                </div>
              
                {/* Chart Controls */}
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                    <span className="text-sm text-indigo-700">Selected Units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-300"></div>
                    <span className="text-sm text-indigo-700">Benchmark</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-200"></div>
                    <span className="text-sm text-indigo-700">Average</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

