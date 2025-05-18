import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChartView } from './BarChartView';
import SubCompetencyView from './SubCompetencyView';

export function TabView({ 
  selectedRegions,
  selectedUnits,
  availableUnits,
  availableRegions,
  unitsByRegion,
  onFilterChange
}) {
  const handleFilterChange = (changes) => {
    if (onFilterChange) {
      onFilterChange(changes);
    }
  };

  return (
    <Tabs defaultValue="competency" className="w-full">
      <TabsList className="grid w-[400px] grid-cols-2 mb-4">
        <TabsTrigger value="competency">Competency View</TabsTrigger>
        <TabsTrigger value="subcompetency">Sub-competency View</TabsTrigger>
      </TabsList>
      
      <TabsContent value="competency">
        <BarChartView
          selectedRegions={selectedRegions}
          selectedUnits={selectedUnits}
          availableUnits={availableUnits}
          availableRegions={availableRegions}
          unitsByRegion={unitsByRegion}
          onFilterChange={handleFilterChange}
        />
      </TabsContent>
      
      <TabsContent value="subcompetency">
        <SubCompetencyView
          selectedRegions={selectedRegions}
          selectedUnits={selectedUnits}
          availableUnits={availableUnits}
          availableRegions={availableRegions}
          unitsByRegion={unitsByRegion}
          onFilterChange={handleFilterChange}
        />
      </TabsContent>
    </Tabs>
  );
} 