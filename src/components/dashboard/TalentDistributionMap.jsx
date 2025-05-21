import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const TalentDistributionMap = ({
  selectedUnits = [],
  availableUnits = [],
  onFilterChange
}) => {
  // State management
  const [distributionData, setDistributionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unitStats, setUnitStats] = useState({});
  const [overallStats, setOverallStats] = useState({ mean: 0, stdDev: 0 });
  const [activeTab, setActiveTab] = useState("unit");
  const [competencies, setCompetencies] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState(null);

  // Helper functions for calculations
  const calculateNormalDistribution = (x, mean, stdDev) => {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return coefficient * Math.exp(exponent);
  };

  const generateDistributionData = (mean, stdDev) => {
    const data = [];
    for (let score = 0; score <= 10; score += 0.1) {
      const density = calculateNormalDistribution(score, mean, stdDev);
      const scaledDensity = density * 50;
      data.push({ score, density: scaledDensity });
    }
    return data;
  };

  const calculatePreciseMean = (scores) => {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, curr) => acc + parseFloat(curr), 0);
    return sum / scores.length;
  };

  const calculateStandardDeviation = (scores, mean) => {
    if (scores.length <= 1) return 0;
    const sumSquaredDiff = scores.reduce((acc, curr) => {
      const diff = parseFloat(curr) - mean;
      return acc + (diff * diff);
    }, 0);
    return Math.sqrt(sumSquaredDiff / (scores.length - 1));
  };

  // Data fetching
  const fetchCompetencies = async () => {
    try {
      console.log('Fetching competencies from /api/reportanalytics/getMainCompetency');
      const response = await fetch('/api/reportanalytics/getMainCompetency', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({})
      });

      console.log('Competency API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Competency API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Competency API Response Data:', data);
      
      if (data.status === 'success' && data.data) {
        const allCompetencies = data.data.flatMap(quiz => 
          (quiz.sections || []).map(section => ({
            id: section.section_id,
            name: section.section_name || `Section ${section.section_id}`,
            quiz_section_id: section.quiz_section_id
          }))
        );
        console.log('Processed Competencies:', allCompetencies);
        setCompetencies(allCompetencies);
        
        // Auto-select first competency if none selected
        if (!selectedCompetency && allCompetencies.length > 0) {
          setSelectedCompetency(allCompetencies[0].quiz_section_id);
        }
      } else {
        console.error('Unexpected data format from competency API:', data);
        setCompetencies([]);
      }
    } catch (error) {
      console.error('Error in fetchCompetencies:', error);
      setCompetencies([]);
    }
  };

  const fetchDistributionData = async () => {
    if (!selectedUnits?.length) { 
      console.log('No units selected, skipping distribution data fetch');
      resetData();
      return;
    }

    console.log('Fetching distribution data for units:', selectedUnits);
    setIsLoading(true);
    
    try {
      const requestBody = { 
        unit: selectedUnits,
        ...(activeTab === 'competency' && selectedCompetency && { competency_id: selectedCompetency })
      };
      
      console.log('Sending request to /api/reportanalytics/getRadarChartMainCompetency with:', requestBody);
      
      const response = await fetch('/api/reportanalytics/getRadarChartMainCompetency', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Distribution API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Distribution API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Distribution API Response Data:', data);
      
      if (data.status === 'success' && data.data?.unit_details) {
        processDistributionData(data.data.unit_details);
      } else {
        console.error('Unexpected data format from distribution API:', data);
        resetData();
      }
    } catch (error) {
      console.error('Error in fetchDistributionData:', error);
      resetData();
    } finally {
      setIsLoading(false);
    }
  };

  const processDistributionData = (unitDetails) => {
    const stats = {};
    let totalScores = [];

    Object.entries(unitDetails).forEach(([unit, sections]) => {
      const scores = activeTab === "competency" && selectedCompetency
        ? getScoresForCompetency(sections, selectedCompetency)
        : getAllScores(sections);
      
      if (scores.length) {
        const mean = calculatePreciseMean(scores);
        const stdDev = calculateStandardDeviation(scores, mean);
        stats[unit] = { mean, stdDev };
        totalScores = [...totalScores, ...scores];
      }
    });

    if (totalScores.length) {
      const overallMean = calculatePreciseMean(totalScores);
      const overallStdDev = calculateStandardDeviation(totalScores, overallMean);
      setOverallStats({ mean: overallMean, stdDev: overallStdDev });
      setUnitStats(stats);
      setDistributionData(generateDistributionData(overallMean, overallStdDev));
    }
  };

  const getScoresForCompetency = (sections, competencyId) => {
    const competencyScore = Object.entries(sections)
      .find(([id]) => id === competencyId);
    return competencyScore ? [competencyScore[1].unit_section_score_average] : [];
  };

  const getAllScores = (sections) => 
    Object.values(sections).map(s => parseFloat(s.unit_section_score_average));

  const resetData = () => {
    setDistributionData([]);
    setUnitStats({});
    setOverallStats({ mean: 0, stdDev: 0 });
  };

  // UI Components
  const getUnitColor = (index) => {
    const colors = [
      '#ff7300', '#8884d8', '#82ca9d', '#ffc658', '#ff5252', '#4dd0e1', '#ba68c8', 
      '#ffd54f', '#a1887f', '#90caf9', '#e57373', '#81c784', '#f06292', '#9575cd'
    ];
    return colors[index % colors.length];
  };

  const getUnitsAboveBelowAverage = () => {
    const { mean } = overallStats;
    const { above, below } = Object.entries(unitStats).reduce((acc, [unit, stats]) => {
      if (stats.mean > mean) acc.above.push(unit);
      else if (stats.mean < mean) acc.below.push(unit);
      return acc;
    }, { above: [], below: [] });
    return { aboveAverage: above, belowAverage: below };
  };

  const { aboveAverage, belowAverage } = getUnitsAboveBelowAverage();

  // Loading States
  const renderChartSkeleton = () => (
    <div className="h-[400px] flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - (i * 5)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompetencySelectorSkeleton = () => (
    <div className="w-full max-w-[500px] mx-auto space-y-2">
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  const handleTabChange = (value) => {
    setIsLoading(true);
    setActiveTab(value);
  };

  // Main render
  const renderErrorState = () => (
    <div className="h-[400px] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg max-w-md">
        <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Error Loading Data</h3>
        <p className="text-sm text-red-500 dark:text-red-400">
          Unable to load the required data. Please try again later or contact support if the problem persists.
        </p>
        <button
          onClick={fetchDistributionData}
          className="mt-3 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  );

  const renderChart = () => (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={distributionData} margin={{ top: 40, right: 30, left: 70, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="score"
            type="number"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            label={{ 
              value: 'Score (0-10)', 
              position: 'bottom',
              offset: 15,
              fill: '#222',
              fontWeight: 600,
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
            stroke="#3b82f6"
            dot={false}
            name="Distribution"
            strokeWidth={2}
          />
          {Object.entries(unitStats).map(([unit, stats], index) => (
            <ReferenceLine
              key={`mean-${unit}`}
              x={stats.mean}
              stroke={getUnitColor(index)}
              strokeWidth={2}
            />
          ))}
          <ReferenceLine
            x={overallStats.mean}
            stroke="#000"
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
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
  );

  const renderCompetencySelector = () => (
    <div className="w-full max-w-[500px] mx-auto">
      <Label>Select Competency:</Label>
      <Select 
        value={selectedCompetency} 
        onValueChange={setSelectedCompetency}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a competency" />
        </SelectTrigger>
        <SelectContent>
          {competencies.map((comp) => (
            <SelectItem key={comp.quiz_section_id} value={comp.quiz_section_id}>
              {comp.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Effects
  useEffect(() => {
    console.log('Component mounted, fetching competencies');
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchCompetencies();
      } catch (error) {
        console.error('Error in initial data load:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      console.log('Component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('Dependencies changed - selectedUnits:', selectedUnits, 
                'activeTab:', activeTab, 
                'selectedCompetency:', selectedCompetency);
                
    const timer = setTimeout(() => {
      if (selectedUnits?.length) {
        console.log('Triggering distribution data fetch');
        fetchDistributionData();
      } else {
        console.log('No units selected, skipping distribution data fetch');
        resetData();
      }
    }, 300); // Small debounce to avoid rapid consecutive calls
    
    return () => clearTimeout(timer);
  }, [selectedUnits, activeTab, selectedCompetency]);

  return (
    <Card className="p-6 h-[800px] flex flex-col">
      <div className="space-y-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">Talent Distribution Map</h2>
          <div className="text-right">
            <p className="font-medium text-sm text-muted-foreground mb-2">
              Mean: <span className="font-semibold">{overallStats.mean.toFixed(2)}</span> | 
              Std Dev: <span className="font-semibold">{overallStats.stdDev.toFixed(2)}</span>
            </p>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium text-green-600">Above Avg: </span>
                <span>{aboveAverage.join(', ') || 'None'}</span>
              </div>
              <div>
                <span className="font-medium text-red-600">Below Avg: </span>
                <span>{belowAverage.join(', ') || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-fit">
            <TabsTrigger value="unit">Unit-wise</TabsTrigger>
            <TabsTrigger value="competency">Competency-wise</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 pt-4">
            <TabsContent value="unit" className="h-full m-0">
              {isLoading ? renderChartSkeleton() : distributionData.length > 0 ? renderChart() : renderErrorState()}
            </TabsContent>

            <TabsContent value="competency" className="h-full m-0 space-y-6">
              {renderCompetencySelector()}
              {isLoading ? renderChartSkeleton() : distributionData.length > 0 ? renderChart() : renderErrorState()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export { TalentDistributionMap };
