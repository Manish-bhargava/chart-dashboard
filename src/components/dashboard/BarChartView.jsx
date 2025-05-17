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
import { SimpleMultiSelect } from "./SimpleMultiSelect"
import { Button } from "../ui/button"
import { Maximize2, Minimize2 } from "lucide-react"
import { API_URL } from '../../config'

// Define bar colors at component level
const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28"];

// Define CustomTooltip component at the top level
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border">
        <p className="font-semibold">{data.unit}</p>
        {data.region && <p>Region: {data.region}</p>}
        <p>Competency: {payload[0].dataKey}</p>
        <p>Score: {payload[0].value?.toFixed(2) || '0'}</p>
        {data.percentile !== undefined && (
          <p>Percentile: {data.percentile.toFixed(2)}%</p>
        )}
        {data.user_count !== undefined && (
          <p>Users: {data.user_count}</p>
        )}
      </div>
    );
  }
  return null;
};

export function BarChartView({ 
  selectedRegions = [], 
  selectedUnits = [], 
  availableUnits = [], 
  availableRegions = [], 
  unitsByRegion = {},
  onFilterChange = () => {},
}) {
  const [selectedCompetencies, setSelectedCompetencies] = useState([]) // Array of IDs
  const [availableCompetencies, setAvailableCompetencies] = useState([]) // Array of {value, label}
  const [displayMode, setDisplayMode] = useState("chart")
  const [isZoomed, setIsZoomed] = useState(false)
  const [apiData, setApiData] = useState(null) 
  const [isLoading, setIsLoading] = useState(false)
  const [dataKeys, setDataKeys] = useState([])
  const [selectedBar, setSelectedBar] = useState(null)
  const [isCompetencyDropdownOpen, setIsCompetencyDropdownOpen] = useState(false)

  // State for pending selections (before Apply)
  const [pendingSelectedCompetencies, setPendingSelectedCompetencies] = useState([]);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Click away handler for competency dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      const competencySelect = document.getElementById('competency-select-container');
      if (competencySelect && !competencySelect.contains(event.target)) {
        setIsCompetencyDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCompetencyChange = (ids) => {
    console.log("[Debug] Competency selection changed:", {
      newSelection: ids,
      currentPending: pendingSelectedCompetencies
    });
    setPendingSelectedCompetencies(ids);
    setHasPendingChanges(true);
  };

  const handleBarClick = (data, index) => {
    console.log("[Debug] Bar clicked:", { data, index });
    setSelectedBar(data);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setAvailableCompetencies([]);
      try {
        const response = await fetch(`/api/reportanalytics/getMainCompetency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.status === "success" && Array.isArray(data.data)) {
          const allCompetencies = data.data.flatMap(quiz =>
            quiz.sections.map(section => ({
              value: section.quiz_section_id,
              label: section.section_name,
              quiz_id: quiz.quiz_id.toString()
            }))
          );

          const uniqueCompetencies = Array.from(new Map(allCompetencies.map(item => [item.value, item])).values());
          console.log("[Debug] Available competencies:", uniqueCompetencies);
          setAvailableCompetencies(uniqueCompetencies);
          setPendingSelectedCompetencies([]);
          setSelectedCompetencies([]);
        } else {
          console.error("[Debug] Failed to fetch competency data:", data);
          setAvailableCompetencies([]);
        }
      } catch (error) {
        console.error("[Debug] Error in fetchInitialData:", error);
        setAvailableCompetencies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedRegions]);

  useEffect(() => {
    const fetchChartData = async () => {
      if (selectedCompetencies?.length === 0 || selectedUnits?.length === 0) {
        setApiData(null);
        setDataKeys([]);
        return;
      }

      setApiData(null);
      setDataKeys([]);
      setIsLoading(true);

      const sectionIds = selectedCompetencies.length > 0 && typeof selectedCompetencies[0] === 'object'
        ? selectedCompetencies.map(c => c.value)
        : selectedCompetencies;

      const payload = {
        unit: selectedUnits,
        section_id: sectionIds.filter(id => id !== null && id !== undefined),
      };

      try {
        const response = await fetch(`/api/reportanalytics/getRadarChartMainCompetency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === "success" && data.data) {
          let transformedData = [];
          let keysForChart = new Set();

          if (data.data.unit_details && data.data.section_detail) {
            const sectionDetails = data.data.section_detail;
            const unitDetails = data.data.unit_details;

            transformedData = Object.entries(unitDetails).map(([unitName, sections]) => {
              // Extract location name from the unit name
              let cleanUnitName = unitName;
              
              // If name is in format "Topic X (Location)"
              const locationMatch = unitName.match(/\((.*?)\)/);
              if (locationMatch) {
                cleanUnitName = locationMatch[1].trim();
              } else {
                // If name is in format "Topic X - Location" or just "Location"
                cleanUnitName = unitName
                  .replace(/^Topic\s*\d+\s*[-–—]?\s*/, '')  // Remove "Topic X" prefix
                  .replace(/\s*[-–—]\s*.+$/, '')  // Remove anything after dash
                  .trim();
              }

              console.log('[Debug] Unit name cleaning:', {
                original: unitName,
                cleaned: cleanUnitName
              });

              const unitEntry = { 
                unit: cleanUnitName,
                originalUnit: unitName 
              };
              selectedCompetencies.forEach(selectedCompOrId => {
                let compId, compLabel;
                if (typeof selectedCompOrId === 'object' && selectedCompOrId !== null) {
                  compId = selectedCompOrId.value;
                  compLabel = selectedCompOrId.label;
                } else {
                  compId = selectedCompOrId;
                  const foundComp = availableCompetencies.find(c => c.value.toString() === compId.toString());
                  compLabel = foundComp ? foundComp.label : `Competency ${compId}`;
                }

                if (compId === null || compId === undefined) return;

                const sectionIdStr = compId.toString();
                const competencyName = (sectionDetails[sectionIdStr] && sectionDetails[sectionIdStr].section_name)
                  ? sectionDetails[sectionIdStr].section_name
                  : compLabel;

                if (sections[sectionIdStr]) {
                  unitEntry[competencyName] = sections[sectionIdStr].unit_section_score_average;
                } else {
                  unitEntry[competencyName] = 0;
                }
                keysForChart.add(competencyName);
              });
              return unitEntry;
            });
          }

          const finalKeys = Array.from(keysForChart);
          setApiData(transformedData);
          setDataKeys(finalKeys);
        }
      } catch (error) {
        console.error(`Error fetching competency data:`, error);
        setApiData([]);
        setDataKeys([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [API_URL, selectedUnits, selectedCompetencies, availableCompetencies]);

  const handleApplyFilters = () => {
    setSelectedCompetencies(pendingSelectedCompetencies);
    setHasPendingChanges(false);
  };

  const renderChart = () => {
    if (!apiData || !dataKeys || dataKeys.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-gray-500">No data to display. Please select competencies and units.</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={apiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="unit" 
            label={{ value: 'Units', position: 'bottom', dy: -10 }}
            height={60}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            domain={[0, 10]} 
            ticks={[0, 2, 4, 6, 8, 10]} 
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              name={key}
              fill={barColors[index % barColors.length]}
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              style={{ cursor: 'pointer' }}
              fillOpacity={selectedBar && selectedBar.dataKey === key ? 1 : 0.8}
            >
              {index === 0 && (
                <LabelList
                  dataKey={key}
                  position="top"
                  formatter={(value) => value?.toFixed(2) || '0'}
                  style={{ fontSize: '10px' }} 
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = () => {
    if (!apiData || apiData.length === 0) {
      return <div className="text-center text-gray-500 py-8">No data to display for the current selection.</div>;
    }

    const headers = ['Unit', ...dataKeys];

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map(header => (
              <TableCell key={header} className="font-semibold">
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header, colIndex) => (
                <TableCell key={colIndex}>
                  {colIndex === 0 ? 
                    row.unit : 
                    (row[header]?.toFixed(2) || 'N/A')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Unit-wise performance in competencies.</CardDescription>
        </div>
      </CardHeader>
      <CardHeader>
        <div className="flex flex-wrap gap-4 mt-2 items-center">
          <div className="flex items-center space-x-2 w-[400px]" id="competency-select-container">
            <Label htmlFor="competency-select-bar" className="whitespace-nowrap text-sm">Competencies:</Label>
            <SimpleMultiSelect
              label="Competencies"
              options={availableCompetencies} 
              value={pendingSelectedCompetencies} 
              onChange={handleCompetencyChange}
              placeholder="Select Competencies"
              showCheckAll={true}
              // className="flex-1"
              className="w-[300px]"
              isOpen={isCompetencyDropdownOpen}
              onOpenChange={setIsCompetencyDropdownOpen}
            />
          </div>

          <Button 
            onClick={handleApplyFilters}
            disabled={isLoading || (!hasPendingChanges && apiData !== null)} 
            className="self-end whitespace-nowrap" 
            size="sm"
          >
            Apply Filter
          </Button>

          {dataKeys.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tabs value={displayMode} onValueChange={setDisplayMode} className="w-[250px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart" className="text-sm">Chart View</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-sm">Analytics View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        {selectedUnits.length > 0 ? (
          dataKeys.length > 0 ? (
            displayMode === "chart" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="unit" 
                    label={{ value: 'Units', position: 'bottom', dy: -10 }}
                    height={60}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    ticks={[0, 2, 4, 6, 8, 10]} 
                    label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {dataKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      name={key}
                      fill={barColors[index % barColors.length]}
                      radius={[4, 4, 0, 0]}
                      onClick={handleBarClick}
                      style={{ cursor: 'pointer' }}
                      fillOpacity={selectedBar && selectedBar.dataKey === key ? 1 : 0.8}
                    >
                      {index === 0 && (
                        <LabelList
                          dataKey={key}
                          position="top"
                          formatter={(value) => value?.toFixed(2) || '0'}
                          style={{ fontSize: '10px' }} 
                        />
                      )}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : renderTable()
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Please select at least one competency to view the chart</p>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Please select at least one unit to view the chart</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}