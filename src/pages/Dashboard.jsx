"use client"
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
import { TabView } from "@/components/dashboard/TabView"

// Ensure BASE_URL is properly formatted
const apiBaseUrl = import.meta.env.VITE_API_URL;
console.log('API Base URL:', apiBaseUrl);
if (!apiBaseUrl) {
  console.error('VITE_API_URL environment variable is not set');
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
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false)
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false)

  // New states for BarChartView
  const [selectedCompetencies, setSelectedCompetencies] = useState([])
  const [availableCompetencies, setAvailableCompetencies] = useState([])
  const [availableSubCompetencyTopics, setAvailableSubCompetencyTopics] = useState([])
  const [selectedSubCompetencyTopicIds, setSelectedSubCompetencyTopicIds] = useState([])
  const [viewMode, setViewMode] = useState("competency")
  const [displayMode, setDisplayMode] = useState("chart")
  const [apiData, setApiData] = useState(null)

  // Click away handler
  useEffect(() => {
    function handleClickOutside(event) {
      const regionSelect = document.getElementById('region-select-container');
      const unitSelect = document.getElementById('unit-select-container');

      if (regionSelect && !regionSelect.contains(event.target)) {
        setIsRegionDropdownOpen(false);
      }
      if (unitSelect && !unitSelect.contains(event.target)) {
        setIsUnitDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch regions and units data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Attempting to fetch data from:', '/api/reportanalytics/getUnitList');
        
        const response = await fetch('/api/reportanalytics/getUnitList', {
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
        console.log('API Response:', data);

        if (data.status === "success" && data.units) {
          const rawUnitsData = data.units;
          console.log("Raw Units Data:", rawUnitsData);

          // Format regions: [{ value: 'Region Name', label: 'Region Name' }, ...]
          const regionsOptions = Object.keys(rawUnitsData).map(regionName => ({
            value: regionName,
            label: regionName
          }));
          console.log("Formatted Regions Options:", regionsOptions);
          setRegions(regionsOptions);

          // Format units within each region
          const formattedUnitsByRegion = {};
          Object.entries(rawUnitsData).forEach(([regionName, units]) => {
            formattedUnitsByRegion[regionName] = units.map(unitName => ({
              value: unitName,
              label: unitName
            }));
          });
          console.log("Formatted Units By Region:", formattedUnitsByRegion);
          setUnitsByRegion(formattedUnitsByRegion);

          // Remove auto-selection of first region and its units
          setSelectedRegions([]);
          setSelectedUnits([]);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setError("Failed to load units data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all available units
  const allUnits = useMemo(() => {
    const units = []
    Object.values(unitsByRegion).forEach(regionUnits => {
      regionUnits.forEach(unit => {
        if (!units.some(u => u.value === unit.value)) {
          units.push(unit)
        }
      })
    })
    return units
  }, [unitsByRegion])

  // Handle unit selection
  const handleUnitChange = (selectedUnitValues) => {
    console.log("[Debug] Manually Selected Units:", selectedUnitValues);
    
    // Simply update selected units without affecting regions
    setSelectedUnits(selectedUnitValues);
  };

  // Handle region selection
  const handleRegionChange = (selectedRegionValues) => {
    console.log("[Debug] Selected Region(s):", selectedRegionValues);
    setSelectedRegions(selectedRegionValues);
    
    // If regions are selected, automatically select their units
    if (selectedRegionValues && selectedRegionValues.length > 0) {
      const unitsToSelect = [];
      selectedRegionValues.forEach(region => {
        const unitsForRegion = unitsByRegion[region] || [];
        unitsToSelect.push(...unitsForRegion.map(unit => unit.value));
      });
      console.log("[Debug] Automatically selecting units for region(s):", unitsToSelect);
      setSelectedUnits(unitsToSelect);
    } else {
      // If no regions selected, clear units only if they were selected via region
      setSelectedUnits([]);
    }
  };

  // Get filtered units based on selected regions
  const availableUnits = useMemo(() => {
    if (!unitsByRegion || Object.keys(unitsByRegion).length === 0) return [];

    // If no regions selected, show all available units
    if (!selectedRegions || selectedRegions.length === 0) {
      return allUnits;
    }

    // Show units from selected regions
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

  const getScoreBackgroundColor = (value) => {
    if (value === null || value === undefined) return 'bg-gray-100';
    if (value >= 8) return 'bg-green-600 text-white';
    if (value >= 7) return 'bg-green-500 text-white';
    // ... more ranges ...
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
              <div className="space-y-2" id="region-select-container">
                <Label htmlFor="region-select" className="text-indigo-600">Region</Label>
                <SimpleMultiSelect
                  options={regions}
                  value={selectedRegions}
                  onChange={handleRegionChange}
                  placeholder="Select Regions"
                  showCheckAll={true}
                  className="border-indigo-200 focus:border-indigo-500"
                  isOpen={isRegionDropdownOpen}
                  onOpenChange={setIsRegionDropdownOpen}
                />
              </div>
              <div className="space-y-2" id="unit-select-container">
                <Label htmlFor="unit-select" className="text-indigo-600">Unit</Label>
                <SimpleMultiSelect
                  options={availableUnits}
                  value={selectedUnits}
                  onChange={handleUnitChange}
                  placeholder="Select Units"
                  showCheckAll={true}
                  className="border-indigo-200 focus:border-indigo-500"
                  isOpen={isUnitDropdownOpen}
                  onOpenChange={setIsUnitDropdownOpen}
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
                      availableUnits={availableUnits}
                      availableRegions={regions}
                      unitsByRegion={unitsByRegion}
                      onFilterChange={handleRegionChange}
                    />
                  )}
                  {activeTab === "bar" && (
                    <TabView
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                      availableUnits={availableUnits}
                      availableRegions={regions}
                      unitsByRegion={unitsByRegion}
                      onFilterChange={({ regions, units }) => {
                        if (regions) setSelectedRegions(regions);
                        if (units) setSelectedUnits(units);
                      }}
                    />
                  )}
                  {activeTab === "heat" && (
                    <HeatmapView
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                      availableUnits={availableUnits}
                      availableRegions={regions}
                      unitsByRegion={unitsByRegion}
                      onFilterChange={handleRegionChange}
                    />
                  )}
                  {activeTab === "talent" && (
                    <TalentDistributionMap
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                      availableUnits={availableUnits}
                      availableRegions={regions}
                      unitsByRegion={unitsByRegion}
                      onFilterChange={handleRegionChange}
                    />
                  )}
                  {activeTab === "bubble" && (
                    <BubbleMatrixPlot
                      selectedRegions={selectedRegions}
                      selectedUnits={selectedUnits}
                      availableUnits={availableUnits}
                      availableRegions={regions}
                      unitsByRegion={unitsByRegion}
                      onFilterChange={handleRegionChange}
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
