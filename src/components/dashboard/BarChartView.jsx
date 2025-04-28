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
import { toast } from "react-hot-toast"

const BASE_URL = import.meta.env.VITE_API_URL;

export function BarChartView({ selectedRegions, selectedUnits }) {
  const [selectedCompetencies, setSelectedCompetencies] = useState([])
  const [availableCompetencies, setAvailableCompetencies] = useState([])
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState([])
  const [availableSubCompetencies, setAvailableSubCompetencies] = useState([])
  const [viewMode, setViewMode] = useState("competency")
  const [displayMode, setDisplayMode] = useState("chart")
  const [isZoomed, setIsZoomed] = useState(false)
  const [apiData, setApiData] = useState(null)
  const [subCompetencyData, setSubCompetencyData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  console.log("BarChartView rendered with:", {
    selectedUnits,
    selectedCompetencies,
    availableCompetencies,
    selectedSubCompetencies,
    availableSubCompetencies,
    viewMode,
    apiData: apiData ? "Data loaded" : "No data",
    subCompetencyData: subCompetencyData ? "Data loaded" : "No data"
  });

  // Fetch competency data
  useEffect(() => {
    const fetchCompetencyData = async () => {
      if (!selectedUnits || selectedUnits.length === 0) {
        console.log("No units selected, skipping competency data fetch");
        return;
      }

      console.log("Fetching subcompetency data");
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Using API URL:", BASE_URL);
        
        const response = await fetch(`${BASE_URL}reportanalytics/getSubCompetency`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({})
        });

        console.log("Subcompetency API response status:", response.status);
        const data = await response.json();
        console.log("Subcompetency API response:", data);
        
        if (data.status === "success") {
          setApiData(data.data);
          
          // Extract competency names from API data
          if (data.data) {
            const competencies = data.data.map(section => section.section_name);
            console.log("Available competencies:", competencies);
            setAvailableCompetencies(competencies);
            // Don't automatically select all competencies
            setSelectedCompetencies([]);

            // Extract and set available subcompetencies for the selected competency
            if (selectedCompetencies.length === 1) {
              const selectedSection = data.data.find(section => section.section_name === selectedCompetencies[0]);
              if (selectedSection) {
                const subCompetencies = selectedSection.topics.map(topic => topic.topic_name);
                setAvailableSubCompetencies(subCompetencies);
              }
            }
          } else {
            console.warn("No data found in API response");
          }
        } else {
          console.error("Failed to fetch subcompetency data:", data);
          toast.error("Failed to fetch subcompetency data");
        }
      } catch (error) {
        console.error("Error fetching subcompetency data:", error);
        toast.error("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetencyData();
  }, [selectedUnits]);

  // Update available subcompetencies when view mode changes
  useEffect(() => {
    if (viewMode === "subcompetency" && apiData) {
      // Get all subcompetencies from all competencies
      const allSubCompetencies = [];
      apiData.forEach(section => {
        if (section.topics) {
          section.topics.forEach(topic => {
            if (topic.topic_name && !allSubCompetencies.includes(topic.topic_name)) {
              allSubCompetencies.push(topic.topic_name);
            }
          });
        }
      });
      setAvailableSubCompetencies(allSubCompetencies);
      setSelectedSubCompetencies([]);
      console.log("Updated available subcompetencies:", allSubCompetencies);
    } else {
      setAvailableSubCompetencies([]);
      setSelectedSubCompetencies([]);
    }
  }, [viewMode, apiData]);

  // Add debug logs for filter rendering
  useEffect(() => {
    console.log("Current filter state:", {
      viewMode,
      selectedCompetencies,
      availableSubCompetencies,
      selectedSubCompetencies,
      subCompetencyData: subCompetencyData ? "Data loaded" : "No data",
      subCompetencyDataLength: subCompetencyData ? subCompetencyData.length : 0
    });
  }, [viewMode, selectedCompetencies, availableSubCompetencies, selectedSubCompetencies, subCompetencyData]);

  // Generate data for the bar chart
  const generateData = () => {
    if (!apiData) {
      console.log("No API data available");
      return [];
    }

    if (viewMode === "competency") {
      // Competency view
      console.log("Generating competency data with:", {
        selectedUnits,
        selectedCompetencies,
        apiData
      });

      return selectedUnits.map(unit => {
        const dataPoint = {
          name: unit,
        };
        
        selectedCompetencies.forEach(comp => {
          const section = apiData.find(section => section.section_name === comp);
          if (section && section.topics) {
            // Calculate average score for all topics in this competency
            const totalScore = section.topics.reduce((sum, topic) => {
              const correctMarks = topic.correct_marks.reduce((sum, mark) => sum + parseFloat(mark), 0);
              const score = (correctMarks / topic.total_marks) * 100;
              return sum + score;
            }, 0);
            dataPoint[comp] = totalScore / section.topics.length;
          }
        });
        
        return dataPoint;
      });
    } else {
      // Subcompetency view
      console.log("Generating subcompetency data with:", {
        selectedSubCompetencies,
        availableSubCompetencies
      });
      
      if (selectedSubCompetencies.length === 0) {
        console.log("No subcompetencies selected");
        return [];
      }

      return selectedUnits.map(unit => {
        const dataPoint = {
          name: unit,
        };
        
        selectedSubCompetencies.forEach(subComp => {
          console.log("Processing subcompetency:", subComp);
          // Find the subcompetency in any competency section
          let foundTopic = null;
          for (const section of apiData) {
            if (section.topics) {
              const topic = section.topics.find(t => t.topic_name === subComp);
              if (topic) {
                foundTopic = topic;
                break;
              }
            }
          }

          if (foundTopic) {
            // Calculate score based on correct_marks and total_marks
            const correctMarks = foundTopic.correct_marks.reduce((sum, mark) => sum + parseFloat(mark), 0);
            const score = (correctMarks / foundTopic.total_marks) * 100;
            dataPoint[subComp] = score;
            console.log("Calculated score for", subComp, ":", score);
          } else {
            console.warn("Topic not found for subcompetency:", subComp);
          }
        });
        
        return dataPoint;
      });
    }
  };

  const data = generateData();
  const dataKeys = viewMode === "competency" ? selectedCompetencies : selectedSubCompetencies;
  
  console.log("Generated data:", {
    data,
    dataKeys,
    viewMode
  });

  // Colors for bars
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", 
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#a4de6c", "#d0ed57", "#ffc658", "#8dd1e1",
    "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c",
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"
  ];

  // Calculate analytics data
  const calculateAnalytics = () => {
    if (!data.length || !dataKeys.length) return null;

    const analytics = [];

    dataKeys.forEach(key => {
      const values = data.map(item => item[key]);
      const maxValue = Math.max(...values);
      const maxUnit = data.find(item => item[key] === maxValue);

      analytics.push({
        competency: key,
        bestUnit: maxUnit.name,
        score: maxValue.toFixed(2)
      });
    });

    return analytics.sort((a, b) => b.score - a.score);
  };

  const analytics = calculateAnalytics();
  console.log("Analytics:", analytics);

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
    <Card className={`h-full ${isZoomed ? 'fixed inset-0 z-50 m-4' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Bar Charts - Unit Performance</CardTitle>
            <CardDescription>
              {viewMode === "subcompetency" 
                ? "Comparison of sub-competencies across selected units"
                : "Comparison of competencies across selected units"}
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
          <div className="flex items-center space-x-2">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="competency">Competency View</TabsTrigger>
                <TabsTrigger value="subcompetency">Sub-Competency View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {viewMode === "competency" ? (
            <div className="flex items-center space-x-2">
              <Label htmlFor="competency-select-bar">Competencies:</Label>
              <SimpleMultiSelect
                options={availableCompetencies}
                value={selectedCompetencies}
                onChange={setSelectedCompetencies}
                placeholder="Select Competencies"
                showCheckAll={true}
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Label htmlFor="sub-competency-select-bar">Sub-competencies:</Label>
              <SimpleMultiSelect
                options={availableSubCompetencies}
                value={selectedSubCompetencies}
                onChange={setSelectedSubCompetencies}
                placeholder="Select Sub-Competencies"
                showCheckAll={true}
              />
            </div>
          )}

          {dataKeys.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tabs value={displayMode} onValueChange={setDisplayMode} className="w-[300px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Chart View</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics View</TabsTrigger>
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
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
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
                  domain={[0, 100]} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />

                {dataKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[index % colors.length]}
                    name={key}
                  >
                    <LabelList dataKey={key} position="top" formatter={(value) => value.toFixed(1)} />
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
                      <TableHead className="w-[400px]">{viewMode === "competency" ? "Competency" : "Sub-Competency"}</TableHead>
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
                {viewMode === "competency" 
                  ? "Please select at least one competency to view the chart" 
                  : "Please select at least one sub-competency to view the chart"}
            </p>
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