import React, { useState, useEffect, useCallback } from 'react';
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
  selectedUnits: propSelectedUnits = [],
  selectedRegions = [],
  availableUnits: propAvailableUnits = [],
  availableRegions = [],
  unitsByRegion = {},
  onFilterChange
}) => {
  // Handle both old and new prop structures
  const selectedUnits = Array.isArray(propSelectedUnits) 
    ? propSelectedUnits 
    : [];
  
  const availableUnits = Array.isArray(propAvailableUnits) 
    ? propAvailableUnits 
    : [];
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
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(false);

  const fetchCompetencies = useCallback(async () => {
    // If we have selectedRegions but no selectedUnits, don't fetch yet
    if (selectedRegions.length > 0 && selectedUnits.length === 0) {
      console.log('Regions selected but no units, skipping competency fetch');
      return;
    }
    
    try {
      setIsLoadingCompetencies(true);
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
      } else {
        console.error('Error processing competency data:', data);
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching competencies:', error);
      setCompetencies([]);
    } finally {
      setIsLoadingCompetencies(false);
    }
  }, [selectedRegions, selectedUnits]);

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
    const COLORS = [
      '#000000', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
      '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22',
      '#17becf', '#ffc658', '#4dd0e1', '#ba68c8', '#a1887f',
      '#90caf9', '#e57373', '#81c784', '#f06292', '#9575cd'
    ];
    return COLORS[index % COLORS.length];
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

  // Show a message when no units are selected
  const renderNoUnitsSelected = () => (
    <div className="h-[400px] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg max-w-md">
        <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-2">No Units Selected</h3>
        <p className="text-sm text-blue-500 dark:text-blue-400 mb-4">
          Please select one or more units to view the talent distribution.
        </p>
      </div>
    </div>
  );

  // Show a message when no competency is selected
  const renderNoCompetencySelected = () => (
    <div className="h-[400px] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg max-w-md">
        <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-2">No Competency Selected</h3>
        <p className="text-sm text-amber-500 dark:text-amber-400 mb-4">
          Please select at least one competency to view the distribution.
        </p>
      </div>
    </div>
  );

  // Loading state for mean and std dev
  const renderLoadingStats = () => (
    <div className="animate-pulse space-y-1">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>
  );

  // Loading state for unit lists (above/below average)
  const renderLoadingUnitLists = () => (
    <div className="space-y-1">
      <div className="flex items-center">
        <span className="font-medium text-green-600 mr-2">Above Avg: </span>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>
      <div className="flex items-center">
        <span className="font-medium text-red-600 mr-2">Below Avg: </span>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>
    </div>
  );

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

  const renderChart = () => {
    // Don't render chart if no data
    if (distributionData.length === 0) return null;
    
    return (
      <div className="min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height={250 + (selectedUnits.length * 8)}>
          <LineChart data={distributionData} margin={{ top: 40, right: 30, left: 70, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="score"
              type="number"
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ dy: 5 }}
              axisLine={false}
              tickLine={false}
              label={{ 
                value: 'Score (0-10)', 
                position: 'bottom',
                offset: 30,
                fill: '#222',
                fontWeight: 600,
                style: {
                  textAnchor: 'middle',
                  fontSize: '14px'
                }
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
  };



  const renderCompetencySelector = () => {
    const selectedCompetencyName = competencies.find(c => c.quiz_section_id === selectedCompetency)?.name || '';
    const displayText = selectedCompetency 
      ? `Selected: ${selectedCompetencyName} (1 of ${competencies.length})`
      : `Select a competency (${competencies.length} available)`;
      
    return (
      <div className="w-full max-w-[500px] mx-auto">
        <Label>Competency:</Label>
        {isLoadingCompetencies ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <p className="text-xs text-muted-foreground text-center">Loading competencies...</p>
          </div>
        ) : (
          <Select 
            value={selectedCompetency || ""} 
            onValueChange={setSelectedCompetency}
            disabled={competencies.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="truncate">
                  {displayText}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {competencies.map((comp) => (
                <SelectItem key={comp.quiz_section_id} value={comp.quiz_section_id}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  // Effects
  useEffect(() => {
    console.log('Component mounted or dependencies changed, fetching competencies');
    const loadData = async () => {
      try {
        // Only fetch if we have selected units or if we're in a context without region/unit selection
        if (selectedUnits.length > 0 || (selectedRegions.length === 0 && Object.keys(unitsByRegion).length === 0)) {
          setIsLoading(true);
          await fetchCompetencies();
        }
      } catch (error) {
        console.error('Error in initial data load:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      console.log('Component unmounting or dependencies changed');
    };
  }, [selectedUnits, selectedRegions, unitsByRegion]);

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

  // Determine if we should show the stats (not in competency view or if a competency is selected)
  const shouldShowStats = activeTab !== 'competency' || (activeTab === 'competency' && selectedCompetency);

  // Render the main component
  return (
    <Card className="p-6 min-h-[800px] flex flex-col">
      <div className="space-y-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">Talent Distribution Map</h2>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unit">Unit View</TabsTrigger>
              <TabsTrigger value="competency">Competency View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Show competency selector only in competency view */}
        {activeTab === 'competency' && (
          <div className="w-full max-w-md">
            {renderCompetencySelector()}
          </div>
        )}
        
        {/* Main chart area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Loading distribution data...</p>
              </div>
            </div>
          ) : activeTab === 'competency' && !selectedCompetency ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-6">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Competency Selected</h3>
              <p className="text-gray-500 max-w-md">Please select a competency from the dropdown above to view the distribution chart.</p>
            </div>
          ) : distributionData.length > 0 ? (
            <div className="space-y-6">
              {/* Statistics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Overall Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Mean Score:</span>
                      <span className="font-medium">{overallStats.mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Deviation:</span>
                      <span className="font-medium">{overallStats.stdDev.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Unit Comparison</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-green-600 font-medium mb-1">Units Above Average:</div>
                      <div className="text-sm">
                        {aboveAverage.length > 0 
                          ? aboveAverage.join(', ') 
                          : 'No units above average'}
                      </div>
                    </div>
                    <div>
                      <div className="text-red-600 font-medium mb-1">Units Below Average:</div>
                      <div className="text-sm">
                        {belowAverage.length > 0 
                          ? belowAverage.join(', ') 
                          : 'No units below average'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart */}
              <div className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={250 + (selectedUnits.length * 8)}>
                  <LineChart data={distributionData} margin={{ top: 40, right: 30, left: 70, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="score"
                      type="number"
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tick={{ dy: 5 }}
                      axisLine={false}
                      tickLine={false}
                      label={{ 
                        value: 'Score (0-10)', 
                        position: 'bottom',
                        offset: 30,
                        fill: '#222',
                        fontWeight: 600,
                        style: {
                          textAnchor: 'middle',
                          fontSize: '14px'
                        }
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
                      <span className="text-sm">{unit} (Mean: {stats.mean.toFixed(2)}, SD: {stats.stdDev.toFixed(2)})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-gray-500">No data available for the selected units.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export { TalentDistributionMap };
