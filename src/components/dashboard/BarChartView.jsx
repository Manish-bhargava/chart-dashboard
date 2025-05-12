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
import { CustomTooltip } from "./CustomTooltip"
import { SimpleMultiSelect } from "./SimpleMultiSelect"
import { Button } from "../ui/button"
import { Maximize2, Minimize2 } from "lucide-react"
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export function BarChartView({ 
  selectedRegions, 
  selectedUnits, 
  availableUnits, 
  availableRegions, 
}) {
  const [selectedCompetencies, setSelectedCompetencies] = useState([]) // Array of IDs
  const [availableCompetencies, setAvailableCompetencies] = useState([]) // Array of {value, label}
  const [displayMode, setDisplayMode] = useState("chart")
  const [isZoomed, setIsZoomed] = useState(false)
  const [apiData, setApiData] = useState(null) 
  const [isLoading, setIsLoading] = useState(false)
  const [dataKeys, setDataKeys] = useState([])

  // State for pending selections (before Apply)
  const [pendingSelectedCompetencies, setPendingSelectedCompetencies] = useState([]);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleCompetencyChange = (ids) => {
    console.log("[Debug] Competency selection changed:", {
      newSelection: ids,
      currentPending: pendingSelectedCompetencies
    });
    setPendingSelectedCompetencies(ids);
    setHasPendingChanges(true);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setAvailableCompetencies([]);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}reportanalytics/getMainCompetency`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
          const allCompetencies = response.data.data.flatMap(quiz =>
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
          console.error("[Debug] Failed to fetch competency data:", response.data);
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
      if (pendingSelectedCompetencies?.length === 0 || selectedUnits?.length === 0) {
        setApiData(null);
        setDataKeys([]);
        return;
      }

      setApiData(null);
      setDataKeys([]);
      setIsLoading(true);
      const url = `${BASE_URL}reportanalytics/getRadarChartMainCompetency`;

      const sectionIds = pendingSelectedCompetencies.length > 0 && typeof pendingSelectedCompetencies[0] === 'object'
        ? pendingSelectedCompetencies.map(c => c.value)
        : pendingSelectedCompetencies;

      const payload = {
        unit: selectedUnits,
        section_id: sectionIds.filter(id => id !== null && id !== undefined),
      };

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      try {
        const response = await axios.post(url, payload, { headers });
        if (response.data.status === "success" && response.data.data) {
          let transformedData = [];
          let keysForChart = new Set();

          if (response.data.data.unit_details && response.data.data.section_detail) {
            const sectionDetails = response.data.data.section_detail;
            const unitDetails = response.data.data.unit_details;

            transformedData = Object.entries(unitDetails).map(([unitName, sections]) => {
              const unitEntry = { unit: unitName };
              pendingSelectedCompetencies.forEach(selectedCompOrId => {
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
  }, [BASE_URL, selectedUnits, pendingSelectedCompetencies]);

  // Function to apply pending filter changes
  const handleApplyFilters = () => {
    setSelectedCompetencies(pendingSelectedCompetencies);
    setHasPendingChanges(false);
  };

  const chartData = apiData || [];
  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return <div className="text-center text-gray-500 py-8">No data to display for the current selection.</div>;
    }

    const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28"];

    console.log("Rendering chart with data:", chartData, "and keys:", dataKeys);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="unit" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={barColors[index % barColors.length]}
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey={key}
                position="top"
                formatter={(value) => value?.toFixed(2) || '0'}
                style={{ fontSize: '10px' }} 
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = () => {
    if (!chartData || chartData.length === 0) {
      return <div className="text-center text-gray-500 py-8">No data to display for the current selection.</div>;
    }

    const headers = ['unit', ...dataKeys];

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map(header => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header, colIndex) => (
                <TableCell key={colIndex}>
                  {colIndex === 0 ? row.unit : (row[header]?.toFixed(2) || 'N/A')}
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
    <Card className={`transition-all duration-300 ease-in-out ${isZoomed ? "fixed inset-0 z-50" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Unit-wise performance in competencies.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsZoomed(!isZoomed)} className="ml-auto">
          {isZoomed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardHeader>
        <div className="flex flex-wrap gap-4 mt-2 items-center">
          <div className="flex items-center space-x-2 flex-1">
            <Label htmlFor="competency-select-bar" className="whitespace-nowrap text-sm">Competencies:</Label>
            <SimpleMultiSelect
              label="Competencies"
              options={availableCompetencies} 
              value={pendingSelectedCompetencies} 
              onChange={handleCompetencyChange}
              placeholder="Select Competencies"
              showCheckAll={true}
              className="flex-1"
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
            displayMode === "chart" ? renderChart() : renderTable()
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