import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { SimpleMultiSelect } from './SimpleMultiSelect';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export const TalentDistributionMap = ({
  selectedUnits = [],
  availableUnits = [],
  onFilterChange
}) => {
  const [distributionData, setDistributionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unitStats, setUnitStats] = useState({});
  const [overallStats, setOverallStats] = useState({ mean: 0, stdDev: 0 });
  const [activeTab, setActiveTab] = useState("unit");
  const [competencies, setCompetencies] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState(null);

  // Function to calculate normal distribution
  const calculateNormalDistribution = (x, mean, stdDev) => {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return coefficient * Math.exp(exponent);
  };

  // Generate distribution data points
  const generateDistributionData = (mean, stdDev) => {
    const data = [];
    for (let score = 0; score <= 10; score += 0.1) {
      const density = calculateNormalDistribution(score, mean, stdDev);
      const scaledDensity = density * 50;
      data.push({
        score: score,
        density: scaledDensity
      });
    }
    return data;
  };

  // Helper function for precise calculation without rounding
  const calculatePreciseMean = (scores) => {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, curr) => acc + parseFloat(curr), 0);
    return sum / scores.length;
  };

  // Helper function to calculate sample standard deviation
  const calculateStandardDeviation = (scores, mean) => {
    if (scores.length <= 1) return 0;
    
    // Calculate sum of squared differences from mean
    const sumSquaredDiff = scores.reduce((acc, curr) => {
      const diff = parseFloat(curr) - mean;
      return acc + (diff * diff);
    }, 0);
    
    // Use (n-1) for sample standard deviation
    return Math.sqrt(sumSquaredDiff / (scores.length - 1));
  };

  // Function to fetch competencies
  const fetchCompetencies = async () => {
    try {
      const response = await fetch('/api/reportanalytics/getMainCompetency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}) // Empty body since no parameters are required
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        // Transform the data to get unique competencies
        const allCompetencies = data.data.flatMap(quiz => 
          quiz.sections.map(section => ({
            id: section.section_id,
            name: section.section_name,
            quiz_section_id: section.quiz_section_id
          }))
        );
        setCompetencies(allCompetencies);
      } else {
        console.error('Invalid competency data format:', data);
      }
    } catch (error) {
      console.error('Error fetching competencies:', error);
      setCompetencies([]);
    }
  };

  // Fetch competencies on mount
  useEffect(() => {
    fetchCompetencies();
  }, []);

  // Modified fetch function to handle both unit and competency views
  const fetchDistributionData = async () => {
    if (!selectedUnits || selectedUnits.length === 0) {
      setDistributionData([]);
      setUnitStats({});
      setOverallStats({ mean: 0, stdDev: 0 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/reportanalytics/getRadarChartMainCompetency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          unit: selectedUnits
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success' && data.data && data.data.unit_details) {
        const stats = {};
        let totalScores = [];

        // Calculate individual unit stats
        Object.entries(data.data.unit_details).forEach(([unit, sections]) => {
          let scores;
          if (activeTab === "competency" && selectedCompetency) {
            // For competency view, only use scores for selected competency
            const competencyScore = Object.entries(sections)
              .find(([id]) => id === selectedCompetency);
            scores = competencyScore ? [competencyScore[1].unit_section_score_average] : [];
          } else {
            // For unit view, use all scores
            scores = Object.values(sections).map(section => 
              parseFloat(section.unit_section_score_average)
            );
          }
          
          if (scores.length > 0) {
            const mean = calculatePreciseMean(scores);
            const stdDev = calculateStandardDeviation(scores, mean);
            stats[unit] = { mean, stdDev };
            totalScores = totalScores.concat(scores);
          }
        });

        if (totalScores.length > 0) {
          const overallMean = calculatePreciseMean(totalScores);
          const overallStdDev = calculateStandardDeviation(totalScores, overallMean);
          setOverallStats({ mean: overallMean, stdDev: overallStdDev });
          setUnitStats(stats);
          const distributionCurve = generateDistributionData(overallMean, overallStdDev);
          setDistributionData(distributionCurve);
        }
      }
    } catch (error) {
      console.error('Error fetching distribution data:', error);
      setDistributionData([]);
      setUnitStats({});
      setOverallStats({ mean: 0, stdDev: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUnits && selectedUnits.length > 0) {
      fetchDistributionData();
    }
  }, [selectedUnits, activeTab, selectedCompetency]);

  // Use a larger color palette for units
  const getUnitColor = (index) => {
    const colors = [
      '#ff7300', '#8884d8', '#82ca9d', '#ffc658', '#ff5252', '#4dd0e1', '#ba68c8', '#ffd54f', '#a1887f', '#90caf9', '#e57373', '#81c784', '#f06292', '#9575cd', '#b2dfdb', '#dce775', '#ffb74d', '#aeea00', '#00bfae', '#ff4081', '#536dfe', '#c51162', '#00b8d4', '#ffab00', '#d50000', '#00c853', '#ff6d00', '#00b8d4', '#d500f9', '#ff1744', '#00e676', '#2979ff', '#ffd600', '#00bfae', '#ff4081', '#536dfe', '#c51162', '#00b8d4', '#ffab00', '#d50000'
    ];
    return colors[index % colors.length];
  };

  const getUnitsAboveBelowAverage = () => {
    const aboveAverage = [];
    const belowAverage = [];
    
    Object.entries(unitStats).forEach(([unit, stats]) => {
      if (stats.mean > overallStats.mean) {
        aboveAverage.push(unit);
      } else if (stats.mean < overallStats.mean) {
        belowAverage.push(unit);
      }
    });

    return { aboveAverage, belowAverage };
  };

  const { aboveAverage, belowAverage } = getUnitsAboveBelowAverage();

  return (
    <Card className="p-4 h-[800px]">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">Talent Distribution Map</h2>
          <div className="text-right">
            <p className="font-bold mb-2">Mean: {overallStats.mean} | Std Dev: {overallStats.stdDev}</p>
            <div className="text-sm space-y-2">
              <div>
                <p className="font-semibold text-green-600">Above Average Units:</p>
                <p>{aboveAverage.join(', ') || 'None'}</p>
              </div>
              <div>
                <p className="font-semibold text-red-600">Below Average Units:</p>
                <p>{belowAverage.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="unit" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="unit">Unit-wise</TabsTrigger>
            <TabsTrigger value="competency">Competency-wise</TabsTrigger>
          </TabsList>

          <TabsContent value="unit" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={distributionData}
                  margin={{ top: 40, right: 30, left: 70, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="score"
                    type="number"
                    domain={[0, 10]}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    label={{ 
                      value: 'X-axis represents Score (0-10)', 
                      position: 'bottom',
                      offset: 15,
                      fill: '#222',
                      fontWeight: 700,
                      dy: -10
                    }}
                  />
                  <YAxis 
                    dataKey="density"
                    type="number"
                    domain={[0, 'auto']}
                    label={{ 
                      value: 'Distribution', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                      offset: -35
                    }}
                  />

                  <Legend verticalAlign="top" height={36} />

                  <Line
                    type="monotone"
                    dataKey="density"
                    stroke="#ff7300"
                    dot={false}
                    name="Distribution"
                    strokeWidth={2}
                  />

                  {/* Unit mean markers */}
                  {Object.entries(unitStats).map(([unit, stats], index) => (
                    <ReferenceLine
                      key={`mean-${unit}`}
                      x={stats.mean}
                      stroke={getUnitColor(index)}
                      strokeWidth={2}
                    />
                  ))}

                  {/* Overall mean reference line */}
                  <ReferenceLine
                    x={overallStats.mean}
                    stroke="#000"
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Custom legend for unit colors */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {Object.entries(unitStats).map(([unit, stats], index) => (
                  <div key={unit} className="flex items-center gap-2">
                    <span
                      style={{
                        display: 'inline-block',
                        width: 16,
                        height: 4,
                        backgroundColor: getUnitColor(index),
                        borderRadius: 2,
                      }}
                    />
                    <span className="text-sm">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="competency" className="space-y-4">
            <div className="w-[500px] mx-auto">
              <Label>Select Competency:</Label>
              <Select 
                value={selectedCompetency} 
                onValueChange={setSelectedCompetency}
              >
                <SelectTrigger className="w-[500px]">
                  <SelectValue placeholder="Choose a competency" />
                </SelectTrigger>
                <SelectContent className="w-[500px]">
                  {competencies.map((comp) => (
                    <SelectItem key={comp.quiz_section_id} value={comp.quiz_section_id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={distributionData}
                  margin={{ top: 40, right: 30, left: 70, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="score"
                    type="number"
                    domain={[0, 10]}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    label={{ 
                      value: 'X-axis represents Score (0-10)', 
                      position: 'bottom',
                      offset: 15,
                      fill: '#222',
                      fontWeight: 700,
                      dy: -10
                    }}
                  />
                  <YAxis 
                    dataKey="density"
                    type="number"
                    domain={[0, 'auto']}
                    label={{ 
                      value: 'Distribution', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                      offset: -35
                    }}
                  />
                 
                  <Legend verticalAlign="top" height={36} />

                  <Line
                    type="monotone"
                    dataKey="density"
                    stroke="#ff7300"
                    dot={false}
                    name="Distribution"
                    strokeWidth={2}
                  />

                  {/* Unit mean markers */}
                  {Object.entries(unitStats).map(([unit, stats], index) => (
                    <ReferenceLine
                      key={`mean-${unit}`}
                      x={stats.mean}
                      stroke={getUnitColor(index)}
                      strokeWidth={2}
                    />
                  ))}

                  {/* Overall mean reference line */}
                  <ReferenceLine
                    x={overallStats.mean}
                    stroke="#000"
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Custom legend for unit colors */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {Object.entries(unitStats).map(([unit, stats], index) => (
                  <div key={unit} className="flex items-center gap-2">
                    <span
                      style={{
                        display: 'inline-block',
                        width: 16,
                        height: 4,
                        backgroundColor: getUnitColor(index),
                        borderRadius: 2,
                      }}
                    />
                    <span className="text-sm">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
