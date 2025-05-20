import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { SimpleMultiSelect } from './SimpleMultiSelect';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

// Define bar colors at component level
const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border">
        <p className="font-semibold">{data.name}</p>
        {/* Show only subcompetency names and scores */}
        {payload.map((entry, index) => (
          <div key={index} className="mt-1">
            <p className="text-sm">
              <span style={{ color: entry.color }}>{entry.dataKey}</span>: {entry.value?.toFixed(1) || '0'}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SubCompetencyView = ({
  selectedRegions = [],
  selectedUnits = [],
  availableUnits = [],
  availableRegions = [],
  unitsByRegion = {},
  onFilterChange = () => {},
}) => {
  const [selectedSubCompetencies, setSelectedSubCompetencies] = useState([]);
  const [availableSubCompetencies, setAvailableSubCompetencies] = useState([]);
  const [isSubCompetencyDropdownOpen, setIsSubCompetencyDropdownOpen] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dataKeys, setDataKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available sub-competencies
  useEffect(() => {
    const fetchSubCompetencies = async () => {
      try {
        console.log('Fetching sub-competencies...');
        const response = await fetch('/api/reportanalytics/getSubCompetency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            report_type: "chart"  // Add this parameter
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Sub-competencies response:', data);

        if (data.status === 'success' && Array.isArray(data.data)) {
          const subComps = data.data.flatMap(section => 
            section.topics.map(topic => ({
              value: topic.topic_id,  // Keep as number
              label: topic.topic_name,
              sectionId: section.section_id,
              sectionName: section.section_name
            }))
          );
          console.log('Processed sub-competencies:', subComps);
          setAvailableSubCompetencies(subComps);
        } else {
          console.error('Invalid sub-competencies data format:', data);
        }
      } catch (error) {
        console.error('Error fetching sub-competencies:', error);
      }
    };

    fetchSubCompetencies();
  }, []);

  const handleSubCompetencyChange = (selected) => {
    console.log('handleSubCompetencyChange raw selected:', selected);
    // Check if we're getting any values
    if (!selected || selected.length === 0) {
      console.log('No values selected');
      setSelectedSubCompetencies([]);
      return;
    }

    // Ensure all selected values are properly processed as integers
    // This fixes potential type comparison issues when matching IDs later
    const processedSelected = selected.map(id => {
      // More robust conversion
      const originalType = typeof id;
      let processed = id;
      if (originalType === 'string') {
        const parsedInt = parseInt(id, 10);
        processed = !isNaN(parsedInt) ? parsedInt : id;
      }

      console.log(`DEBUGGING - Converted ID: ${id} (${originalType}) → ${processed} (${typeof processed})`);
      return processed;
    });
    
    console.log('DEBUGGING - Processed selected IDs:', processedSelected);
    console.log('DEBUGGING - Available subcompetencies:', 
      availableSubCompetencies.map(sc => ({ id: sc.value, type: typeof sc.value, label: sc.label }))
    );

    // Verify each ID actually exists in available options
    const foundIDs = processedSelected.filter(id => 
      availableSubCompetencies.some(option => 
        option.value === id || String(option.value) === String(id)
      )
    );
    
    if (foundIDs.length !== processedSelected.length) {
      console.log('DEBUGGING - Some selected IDs are not in the available options!', {
        selected: processedSelected,
        found: foundIDs,
        missing: processedSelected.filter(id => !foundIDs.includes(id))
      });
    }
    
    // Store the selected values directly without conversion
    setSelectedSubCompetencies(processedSelected);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('sub-competency-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsSubCompetencyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyFilter = async () => {
    if (selectedUnits.length === 0 || selectedSubCompetencies.length === 0) {
      console.log('Filter conditions not met:', {
        selectedUnits,
        selectedSubCompetencies
      });
      return;
    }

    setIsLoading(true);
    try {
      // Ensure topic_id values are correctly formatted as integers
      const topicIds = selectedSubCompetencies.map(id => {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return isNaN(numericId) ? id : numericId; // Fallback to original if parsing fails
      });
      
      console.log('DEBUGGING - Prepared topic IDs for API call:', {
        original: selectedSubCompetencies,
        processed: topicIds
      });
      
      const payload = {
        unit: selectedUnits,
        topic_id: topicIds,
        report_type: "chart"  // Add this parameter
      };
      console.log('Sending request payload:', payload);

      console.log('Selected subcompetencies for API call:', topicIds);
      const response = await fetch('/api/reportanalytics/getSubCometencyUnitReportTopicFilter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log('Raw Response:', response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Parsed Response Data:', data);
      
      if (data.status === 'success') {
        const formattedData = Array.isArray(data.data) ? 
          data.data.reduce((acc, item) => {
            if (item.unit && item.topic_detail) {
              acc[item.unit] = {
                topic_detail: item.topic_detail
              };
            }
            return acc;
          }, {}) : 
          data.data;

        console.log('Formatted API Data:', formattedData);
        console.log('Topic detail structure example:', Object.values(formattedData)[0]?.topic_detail);
        setApiData(formattedData);
      } else {
        console.error('API returned error status:', data);
        setApiData(null);
      }
    } catch (error) {
      console.error('Error fetching sub-competency data:', error);
      setApiData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Process apiData when it changes to create chart data and data keys
  useEffect(() => {
    const transformDataForChart = () => {
      // Create lookup tables for better mapping
      const topicIdToNameMap = {};
      
      // Populate the lookup table
      if (availableSubCompetencies && availableSubCompetencies.length > 0) {
        availableSubCompetencies.forEach(subComp => {
          if (subComp.value !== undefined && subComp.label) {
            // Store both as string and number keys for flexibility
            topicIdToNameMap[subComp.value] = subComp.label;
            topicIdToNameMap[String(subComp.value)] = subComp.label;
          }
        });
      }
      
      console.log('DEBUGGING - Created topic ID to name mapping:', topicIdToNameMap);
      
      console.log('Starting data transformation with apiData:', apiData);
      console.log('DEBUGGING - Available SubCompetencies:', availableSubCompetencies);
      if (!apiData) {
        console.log('No apiData available, setting empty arrays');
        setChartData([]);
        setDataKeys([]);
        return;
      }
      
      // First, collect all subcompetencies to create dataKeys
      const subCompetencyMap = new Map();
      const transformedData = {};
      
      console.log('Processing apiData to extract subcompetencies');
      
      // First pass - collect all subcompetencies and initialize unit data
      Object.entries(apiData).forEach(([unit, unitData]) => {
        console.log('Processing unit:', unit);
        transformedData[unit] = { name: unit };
        
        const topicDetails = unitData.topic_detail || {};
        console.log('DEBUGGING - Topic details for unit:', unit);
        console.log('DEBUGGING - Topic details object:', JSON.stringify(topicDetails, null, 2));
        console.log('Topic details count:', Object.keys(topicDetails).length);
        
        Object.entries(topicDetails).forEach(([topicId, topicData]) => {
          console.log('DEBUGGING - Processing topic ID:', topicId, 'Type:', typeof topicId);
          // Convert topicId to integer for proper comparison
          const topicIdInt = parseInt(topicId, 10);
          console.log('DEBUGGING - Converted topicIdInt:', topicIdInt, 'Type:', typeof topicIdInt);
          // Find the matching subcompetency in available options
          let subComp = availableSubCompetencies.find(sc => {
            console.log('DEBUGGING - Comparing:', {
              'topic_id': topicIdInt,
              'sc.value': sc.value,
              'sc.value type': typeof sc.value,
              'are equal': sc.value === topicIdInt,
              'string compare': String(sc.value) === String(topicIdInt)
            });
            return sc.value === topicIdInt || String(sc.value) === String(topicIdInt);
          });
          
          // If not found, try as string
          if (!subComp) {
            console.log('DEBUGGING - No match found with numeric comparison, trying string comparison');
            subComp = availableSubCompetencies.find(sc => String(sc.value) === topicId);
          }
          
          // Try lookup from our prepared mapping
          const lookupName = topicIdToNameMap[topicId] || topicIdToNameMap[topicIdInt];
          
          // Use better fallback with more debugging
          let subCompName = 'Unknown Topic';
          if (subComp && subComp.label) {
            subCompName = subComp.label;
            console.log('DEBUGGING - Found matching subcomp:', subComp);
          } else if (lookupName) {
            // Use our lookup table as a fallback
            subCompName = lookupName;
            console.log('DEBUGGING - Found name from lookup table:', lookupName);
          } else {
            console.log('DEBUGGING - Failed to find subcompetency name for topicId:', topicId);
            console.log('DEBUGGING - Available subcompetencies IDs:', 
              availableSubCompetencies.map(sc => ({ 
                id: sc.value,
                idType: typeof sc.value,
                name: sc.label 
              }))
            );
            console.log('Could not find subcompetency name for topicId:', topicId, 
              'Available subcompetencies:', availableSubCompetencies.map(sc => ({ id: sc.value, name: sc.label })));
            subCompName = `Topic ${topicId}`;
          }
          console.log('Found subCompetency:', subCompName);
          
          // Store the subcompetency name as a key
          subCompetencyMap.set(subCompName, true);
          
          // Add the score for this subcompetency to the unit's data point
          transformedData[unit][subCompName] = parseFloat(topicData.unit_topic_score_average);
          
          // Store additional data for tooltip
          transformedData[unit][`${subCompName}_percentile`] = parseFloat(topicData.unit_topic_score_percentile);
          transformedData[unit][`${subCompName}_totalQuestions`] = parseInt(topicData.topic_total_question);
        });
      });
      
      // Convert to array format expected by Recharts
      const newChartData = Object.values(transformedData);
      console.log('Transformed data by unit:', newChartData);
      
      // Extract dataKeys (subcompetency names)
      const newDataKeys = Array.from(subCompetencyMap.keys());
      console.log('Extracted dataKeys:', newDataKeys);
      
      // Update state only once
      setChartData(newChartData);
      setDataKeys(newDataKeys);
    };
    
    transformDataForChart();
  }, [apiData, availableSubCompetencies]); // Only run when apiData or availableSubCompetencies change
  
  // This is a safe function that can be called during rendering
  const getChartData = () => {
    return chartData;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-[400px]" id="sub-competency-dropdown">
            <Label htmlFor="sub-competency-select">Sub-competencies:</Label>
            <SimpleMultiSelect
              label="Sub-competencies"
              options={availableSubCompetencies}
              value={selectedSubCompetencies}
              valueCheck={(selectedValue, optionValue) => {
                return String(selectedValue) === String(optionValue);
              }}
              onChange={(selected) => {
                console.log('SimpleMultiSelect onChange:', selected);
                // Ensure the selected values match expected format
                handleSubCompetencyChange(selected.map(value => 
                  // Convert to number if it's a string and represents a number
                  typeof value === 'string' && !isNaN(parseInt(value, 10)) ? parseInt(value, 10) : value
                ));
              }}
              placeholder="Select Sub-competencies"
              showCheckAll={true}
              isOpen={isSubCompetencyDropdownOpen}
              onOpenChange={setIsSubCompetencyDropdownOpen}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleApplyFilter}
              disabled={selectedUnits.length === 0 || selectedSubCompetencies.length === 0}
            >
              Apply Filter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : apiData ? (
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={getChartData()} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
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
                    fillOpacity={0.8}
                    >
                      <LabelList
                        dataKey={key}
                        position="top"
                        formatter={(value) => value?.toFixed(1) || '0'}
                        style={{ fontSize: '10px' }}
                      />
                    </Bar>
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Select sub-competencies and click Apply Filter to view data</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubCompetencyView; 