import React, { useState, useEffect } from 'react';
import { SimpleMultiSelect } from './SimpleMultiSelect';

const CompetencyFilters = ({ onFilterChange }) => {
  const [regions, setRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log('Regions API Response:', data);

        if (data.success && data.data) {
          const transformedRegions = data.data.map(region => ({
            value: region,
            label: region
          }));
          setRegions(transformedRegions);
          setSelectedRegions(transformedRegions.map(r => r.value));
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Fetch units when regions change
  useEffect(() => {
    const fetchUnits = async () => {
      if (selectedRegions.length === 0) return;

      try {
        setIsLoading(true);
        const fetchPromises = selectedRegions.map(region => 
          fetch('/api/api/reportanalytics/getUnitList', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ region })
          }).then(res => res.json())
        );

        const responses = await Promise.all(fetchPromises);
        console.log('Units API Responses:', responses);

        const allUnits = new Set();
        responses.forEach(response => {
          if (response.success && response.data) {
            const units = response.data.map(unit => ({
              value: unit,
              label: unit
            }));
            units.forEach(unit => allUnits.add(JSON.stringify(unit)));
          }
        });

        const uniqueUnits = Array.from(allUnits).map(unit => JSON.parse(unit));
        setUnits(uniqueUnits);
        setSelectedUnits(uniqueUnits.map(u => u.value));
      } catch (error) {
        console.error('Error fetching units:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, [selectedRegions]);

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        regions: selectedRegions,
        units: selectedUnits
      });
    }
  }, [selectedRegions, selectedUnits, onFilterChange]);

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
          onChange={setSelectedRegions}
          placeholder="Select Region"
          showCheckAll={true}
        />
      </div>
      <div className="w-full md:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <SimpleMultiSelect
          options={units}
          value={selectedUnits}
          onChange={setSelectedUnits}
          placeholder="Select Unit"
          showCheckAll={true}
        />
      </div>
    </div>
  );
};

export default CompetencyFilters; 