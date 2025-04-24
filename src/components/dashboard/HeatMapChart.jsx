import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { toast } from "react-hot-toast"

// Performance legend colors and labels
const performanceLegend = [
  { range: "90+", label: "Top Tier", color: "#22C55E" },
  { range: "80-89", label: "High Performing", color: "#4ADE80" },
  { range: "70-79", label: "Above Average", color: "#86EFAC" },
  { range: "60-69", label: "Average", color: "#FDE047" },
  { range: "50-59", label: "Below Average", color: "#F59E0B" },
  { range: "40-49", label: "Needs Focus", color: "#FB923C" },
  { range: "<40", label: "Priority Concern", color: "#EF4444" }
]

// Color scale for heat map
const getColorByValue = (value) => {
  if (value >= 90) return performanceLegend[0].color
  if (value >= 80) return performanceLegend[1].color
  if (value >= 70) return performanceLegend[2].color
  if (value >= 60) return performanceLegend[3].color
  if (value >= 50) return performanceLegend[4].color
  if (value >= 40) return performanceLegend[5].color
  return performanceLegend[6].color
}

// Custom tooltip for heat map
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

export function HeatMapChart({ selectedRegions, selectedUnits }) {
  const [viewMode, setViewMode] = useState("score")
  const [heatMapData, setHeatMapData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredCell, setHoveredCell] = useState(null)

  useEffect(() => {
    const fetchHeatMapData = async () => {
      if (!selectedUnits || selectedUnits.length === 0) return

      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/api/reportanalytics/getRadarChartMainCompetency", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            unit: selectedUnits
          })
        })

        const data = await response.json()
        if (data.status === "success") {
          // Transform the data into heat map format
          const transformedData = selectedUnits.map(unit => {
            const unitData = data.data.unit_details[unit]
            const row = { unit }
            
            // Add each competency score and percentile
            Object.entries(data.data.section_detail).forEach(([sectionId, section]) => {
              if (unitData && unitData[sectionId]) {
                row[`${section.section_name}_score`] = unitData[sectionId].unit_section_score_average
                row[`${section.section_name}_percentile`] = unitData[sectionId].unit_section_score_percentile
              }
            })
            
            return row
          })
          
          setHeatMapData(transformedData)
        } else {
          toast.error("Failed to fetch heat map data")
        }
      } catch (error) {
        console.error("Error fetching heat map data:", error)
        toast.error("An error occurred while fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeatMapData()
  }, [selectedUnits])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!selectedUnits || selectedUnits.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select at least one unit to view the heat map</p>
      </div>
    )
  }

  // Get competencies from section_detail
  const competencies = heatMapData.length > 0 
    ? Object.keys(heatMapData[0])
      .filter(key => key !== 'unit')
      .filter(key => !key.endsWith('_percentile'))
      .map(key => key.replace('_score', ''))
    : []

  const getValue = (row, comp) => {
    const suffix = viewMode === 'score' ? '_score' : '_percentile'
    return row[`${comp}${suffix}`]
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Performance Heat Map</CardTitle>
        <div className="flex justify-between items-center">
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="score">Score View</TabsTrigger>
              <TabsTrigger value="percentile">Percentile View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto p-4">
          <div className="min-w-full">
            {/* Header row */}
            <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(140px,1fr))] gap-4 mb-4">
              <div className="font-semibold text-sm p-3">Unit</div>
              {competencies.map((comp) => (
                <div key={comp} className="font-semibold text-sm p-3 text-center">
                  {comp}
                </div>
              ))}
            </div>

            {/* Data rows */}
            <div className="space-y-4">
              {heatMapData.map((row) => (
                <div key={row.unit} className="grid grid-cols-[200px_repeat(auto-fill,minmax(140px,1fr))] gap-4">
                  <div className="text-sm p-3 font-medium">{row.unit}</div>
                  {competencies.map((comp) => {
                    const value = getValue(row, comp)
                    const isHovered = hoveredCell === `${row.unit}-${comp}`
                    
                    return (
                      <div
                        key={`${row.unit}-${comp}`}
                        className={`text-sm p-3 text-center rounded-lg transition-all duration-200 cursor-pointer
                          ${isHovered ? 'transform scale-105 shadow-lg z-10' : 'shadow-sm'}`}
                        style={{
                          backgroundColor: getColorByValue(value),
                          color: value >= 60 ? 'white' : 'black'
                        }}
                        onMouseEnter={() => setHoveredCell(`${row.unit}-${comp}`)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div className="font-medium">{Math.round(value)}{viewMode === 'percentile' ? '%' : ''}</div>
                        {isHovered && (
                          <div className="absolute bg-white p-3 rounded-lg shadow-lg text-black text-xs mt-2 z-20">
                            <div className="font-medium mb-1">{row.unit}</div>
                            <div>{comp}</div>
                            <div className="mt-1">{viewMode === 'score' ? 'Score' : 'Percentile'}: {Math.round(value)}{viewMode === 'percentile' ? '%' : ''}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Legend */}
        <div className="mt-8 px-4">
          <h3 className="text-lg font-semibold mb-3">Performance Legend</h3>
          <div className="flex flex-wrap gap-3">
            {performanceLegend.map(({ range, label, color }) => (
              <div
                key={range}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm shadow-sm"
                style={{ backgroundColor: color }}
              >
                {range}: {label}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 