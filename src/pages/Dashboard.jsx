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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { SimpleMultiSelect } from "../components/dashboard/SimpleMultiSelect"
import { RadarChartView } from "../components/dashboard/RadarChartView"
import { BarChartView } from "../components/dashboard/BarChartView"
import { HeatmapView } from "../components/dashboard/HeatmapView"
import { TalentDistributionMap } from "../components/dashboard/TalentDistributionMap"
import { BubbleMatrixPlot } from "../components/dashboard/BubbleMatrixPlot"
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

  // New states for BarChartView
  const [selectedCompetencies, setSelectedCompetencies] = useState([])
  const [availableCompetencies, setAvailableCompetencies] = useState([])
  const [availableSubCompetencyTopics, setAvailableSubCompetencyTopics] = useState([])
  const [selectedSubCompetencyTopicIds, setSelectedSubCompetencyTopicIds] = useState([])
  const [viewMode, setViewMode] = useState("competency")
  const [displayMode, setDisplayMode] = useState("chart")
  const [isZoomed, setIsZoomed] = useState(false)
  const [apiData, setApiData] = useState(null)

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

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Raw API Response (getUnitList):", data) // Log raw data

        if (data.status === "success" && data.units) {
          const rawUnitsData = data.units
          console.log("Raw Units Data:", rawUnitsData) // Log units part

          // Format regions: [{ value: 'Region Name', label: 'Region Name' }, ...]
          const regionsOptions = Object.keys(rawUnitsData).map(regionName => ({
            value: regionName,
            label: regionName
          }))
          console.log("Formatted Regions Options:", regionsOptions) // Log formatted regions
          setRegions(regionsOptions) // Store formatted regions

          // Format units within each region: { 'Region Name': [{ value: 'Unit Name', label: 'Unit Name' }, ...], ... }
          const formattedUnitsByRegion = {}
          Object.keys(rawUnitsData).forEach(regionName => {
            formattedUnitsByRegion[regionName] = rawUnitsData[regionName].map(unitName => ({
              value: unitName,
              label: unitName
            }))
          })
          console.log("Formatted Units By Region:", formattedUnitsByRegion) // Log formatted units
          setUnitsByRegion(formattedUnitsByRegion) // Store formatted units

          // Select the first region and its units by default (using values/IDs)
          if (regionsOptions.length > 0) {
            const firstRegionValue = regionsOptions[0].value // Get the value ('Region Name')
            setSelectedRegions([firstRegionValue]) // Select by value

            // Get units for the first region using the value, ensure fallback to empty array
            const firstRegionUnits = formattedUnitsByRegion[firstRegionValue] || []
            // Select all unit values (IDs) for the first region by default
            setSelectedUnits(firstRegionUnits.map(unit => unit.value))
          }
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
      regionUnits.forEach(unit => units.add(unit.value))
    })
    return Array.from(units)
  }, [unitsByRegion])

  // Get filtered units based on selected regions, formatted for SimpleMultiSelect
  const availableUnits = useMemo(() => {
    if (!unitsByRegion || Object.keys(unitsByRegion).length === 0) return [];

    // If no regions selected, show all units from all regions
    if (!selectedRegions || selectedRegions.length === 0) {
      return Object.values(unitsByRegion).flat();
    }

    // Show units from selected regions
    return selectedRegions.flatMap(regionValue => unitsByRegion[regionValue] || []);
  }, [selectedRegions, unitsByRegion]);

  // Handle region selection
  const handleRegionChange = (selectedRegionValues) => {
    console.log("Selected regions:", selectedRegionValues);
    setSelectedRegions(selectedRegionValues);
    
    // Don't automatically select all units when regions change
    // Let the user choose units manually
  };

  // Handle unit selection
  const handleUnitChange = (selectedUnits) => {
    console.log("Selected units:", selectedUnits);
    setSelectedUnits(selectedUnits);
  };

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
            <div className="text-xs text-indigo-200"> 2025 Bodhi Labs</div>
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
                    <RadarChartView
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                    />
                  )}
                  {activeTab === "bar" && (
                    <BarChartView
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                      availableUnits={availableUnits}
                      availableRegions={regions}
                    />
                  )}
                  {activeTab === "heat" && (
                    <HeatmapView
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                    />
                  )}
                  {activeTab === "talent" && (
                    <TalentDistributionMap
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                    />
                  )}
                  {activeTab === "bubble" && (
                    <BubbleMatrixPlot
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                    />
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
