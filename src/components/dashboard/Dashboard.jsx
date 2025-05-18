import React, { useState } from 'react';
import { TabView } from './TabView';
import { RadarChart } from './RadarChart';
import { HeatMap } from './HeatMap';
import { SubCompetencyView } from './SubCompetencyView';
import { TalentDistributionMap } from './TalentDistributionMap';

const Dashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([
    { value: 'North', label: 'North' },
    { value: 'South', label: 'South' },
    { value: 'East', label: 'East' },
    { value: 'West', label: 'West' },
    { value: 'Central', label: 'Central' }
  ]);

  const handleFilterChange = ({ selectedRegions: newRegions, selectedUnits: newUnits }) => {
    if (newRegions !== undefined) setSelectedRegions(newRegions);
    if (newUnits !== undefined) setSelectedUnits(newUnits);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Nurse Assessment Dashboard</h1>
      
      {/* Talent Distribution Map */}
      <TalentDistributionMap
        selectedUnits={selectedUnits}
        availableUnits={availableUnits}
        onFilterChange={handleFilterChange}
      />

      {/* Other components */}
      <RadarChart
        selectedRegions={selectedRegions}
        selectedUnits={selectedUnits}
        availableUnits={availableUnits}
        availableRegions={availableRegions}
        onFilterChange={handleFilterChange}
      />
      
      <TabView
        selectedRegions={selectedRegions}
        selectedUnits={selectedUnits}
        availableUnits={availableUnits}
        availableRegions={availableRegions}
        onFilterChange={handleFilterChange}
      />

      <HeatMap
        selectedRegions={selectedRegions}
        selectedUnits={selectedUnits}
        availableUnits={availableUnits}
        availableRegions={availableRegions}
        onFilterChange={handleFilterChange}
      />

      <SubCompetencyView
        selectedRegions={selectedRegions}
        selectedUnits={selectedUnits}
        availableUnits={availableUnits}
        availableRegions={availableRegions}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default Dashboard; 