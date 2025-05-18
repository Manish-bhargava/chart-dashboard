import React, { useState, useEffect } from 'react';
import { SimpleMultiSelect } from './SimpleMultiSelect';

const CompetencyFilters = ({ onFilterChange }) => {
  const [regions, setRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unitsByRegion, setUnitsByRegion] = useState({});

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('/api/api/reportanalytics/getRegionList', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch regions');
        }

        const data = await response.json();
        console.log('[Debug] Regions API Response:', data);

        if (data.regions) {
          const transformedRegions = data.regions.map(region => ({
            value: region,
            label: region
          }));
          console.log('[Debug] Transformed Regions:', transformedRegions);
          setRegions(transformedRegions);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        setError(error.message);
      }
    };

    fetchRegions();
  }, []);

  // Fetch units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/api/reportanalytics/getUnitList', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch units');
        }

        const data = await response.json();
        console.log('[Debug] Units API Response:', data);

        if (data.status === "success" && data.units) {
          setUnitsByRegion(data.units);
          
          // Create units options for the dropdown
          const allUnits = Object.entries(data.units).flatMap(([region, units]) =>
            units.map(unit => ({
              value: unit,
              label: unit,
              region: region
            }))
          );
          console.log('[Debug] All Units Options:', allUnits);
          setUnits(allUnits);
        }
      } catch (error) {
        console.error('Error fetching units:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, []); // Only fetch once at component mount

  // Handle region selection change
  const handleRegionChange = (newSelectedRegions) => {
    console.log('[Debug] Region Selection Changed:', newSelectedRegions);
    setSelectedRegions(newSelectedRegions);

    // Get all units for selected regions
    const selectedRegionUnits = newSelectedRegions.flatMap(region => {
      const unitsForRegion = unitsByRegion[region] || [];
      console.log(`[Debug] Units for ${region}:`, unitsForRegion);
      return unitsForRegion;
    });

    console.log('[Debug] Selected Region Units:', selectedRegionUnits);
    
    // Update selected units
    setSelectedUnits(selectedRegionUnits);

    // Notify parent of changes
    if (onFilterChange) {
      const changes = {
        regions: newSelectedRegions,
        units: selectedRegionUnits
      };
      console.log('[Debug] Notifying parent of changes:', changes);
      onFilterChange(changes);
    }
  };

  // Handle unit selection change
  const handleUnitChange = (newSelectedUnits) => {
    console.log('[Debug] Unit Selection Changed:', newSelectedUnits);
    setSelectedUnits(newSelectedUnits);
    
    // Update regions based on selected units
    const selectedUnitRegions = new Set(
      units
        .filter(unit => newSelectedUnits.includes(unit.value))
        .map(unit => unit.region)
    );
    
    // Only update regions if they've changed
    const newRegions = Array.from(selectedUnitRegions);
    if (JSON.stringify(newRegions.sort()) !== JSON.stringify(selectedRegions.sort())) {
      setSelectedRegions(newRegions);
    }
    
    // Notify parent of changes
    if (onFilterChange) {
      const changes = {
        regions: newRegions,
        units: newSelectedUnits
      };
      console.log('[Debug] Notifying parent of unit changes:', changes);
      onFilterChange(changes);
    }
  };

  // Filter available units based on selected regions
  const getFilteredUnits = () => {
    if (selectedRegions.length === 0) {
      console.log('[Debug] No regions selected, showing all units');
      return units;
    }
    
    const filteredUnits = units.filter(unit => selectedRegions.includes(unit.region));
    console.log('[Debug] Filtered Units:', filteredUnits);
    return filteredUnits;
  };

  // Effect to update selected units when unitsByRegion changes
  useEffect(() => {
    console.log('[Debug] unitsByRegion changed:', unitsByRegion);
    console.log('[Debug] current selectedRegions:', selectedRegions);
    
    if (Object.keys(unitsByRegion).length > 0 && selectedRegions.length > 0) {
      const unitsToSelect = selectedRegions.flatMap(region => unitsByRegion[region] || []);
      console.log('[Debug] Automatically selecting units:', unitsToSelect);
      setSelectedUnits(unitsToSelect);
      
      // Notify parent of initial unit selection
      if (onFilterChange) {
        onFilterChange({
          regions: selectedRegions,
          units: unitsToSelect
        });
      }
    }
  }, [unitsByRegion, selectedRegions]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="w-full md:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
        <SimpleMultiSelect
          options={regions}
          value={selectedRegions}
          onChange={handleRegionChange}
          placeholder="Select Region"
          showCheckAll={true}
        />
      </div>
      <div className="w-full md:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <SimpleMultiSelect
          options={getFilteredUnits()}
          value={selectedUnits}
          onChange={handleUnitChange}
          placeholder="Select Unit"
          showCheckAll={true}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default CompetencyFilters; 