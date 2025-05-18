// import React from 'react';
// import { Card } from "../ui/card";
// import {
//   ScatterChart,
//   Scatter,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from 'recharts';

// export const BubbleChart = ({ data }) => {
//   // Transform data for bubble chart
//   const transformData = (rawData) => {
//     if (!rawData?.data?.unit_details || !rawData?.data?.section_detail) return [];

//     const transformedData = [];
//     Object.entries(rawData.data.unit_details).forEach(([unit, sections]) => {
//       Object.entries(sections).forEach(([sectionId, sectionData]) => {
//         const sectionName = rawData.data.section_detail[sectionId]?.section_name;
//         if (sectionName) {
//           transformedData.push({
//             unit,
//             section: sectionName,
//             score: sectionData.unit_section_score_average,
//             percentile: sectionData.unit_section_score_percentile,
//             users: sectionData.users_count, // Add users count for bubble size
//           });
//         }
//       });
//     });
//     return transformedData;
//   };

//   const chartData = transformData(data);

//   // Calculate min and max users for scaling bubble sizes
//   const minUsers = Math.min(...chartData.map(item => item.users));
//   const maxUsers = Math.max(...chartData.map(item => item.users));
  
//   // Function to scale bubble size based on user count
//   const getBubbleSize = (users) => {
//     // More dramatic scaling based on user count
//     const baseSize = 20; // Base size for smallest bubbles
//     const scaleFactor = 15; // Scaling factor to amplify differences
    
//     // Calculate relative size based on user count
//     return baseSize + (users * scaleFactor);
//   };

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-3 border border-gray-200 rounded shadow">
//           <p className="font-semibold">{data.unit}</p>
//           <p>{data.section}</p>
//           <p>Score: {data.score.toFixed(2)}</p>
//           <p>Percentile: {data.percentile.toFixed(2)}</p>
//           <p>Users: {data.users}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Generate unique colors for each unit
//   const getUnitColor = (unit) => {
//     const colors = ['#ff7300', '#8884d8', '#82ca9d', '#ffc658', '#ff5252'];
//     const unitIndex = [...new Set(chartData.map(item => item.unit))].indexOf(unit);
//     return colors[unitIndex % colors.length];
//   };

//   return (
//     <Card className="p-4">
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Score vs Percentile Distribution</h2>
//         <div className="h-[400px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <ScatterChart
//               margin={{
//                 top: 20,
//                 right: 20,
//                 bottom: 20,
//                 left: 20,
//               }}
//             >
//               <CartesianGrid />
//               <XAxis 
//                 type="number" 
//                 dataKey="score" 
//                 name="Score"
//                 domain={[0, 10]}
//                 label={{ value: 'Score', position: 'bottom' }}
//               />
//               <YAxis
//                 type="number"
//                 dataKey="percentile"
//                 name="Percentile"
//                 domain={[0, 100]}
//                 label={{ value: 'Percentile', angle: -90, position: 'insideLeft' }}
//               />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend verticalAlign="top" height={36} />
//               {
//                 // Group data by unit and create a scatter for each unit
//                 [...new Set(chartData.map(item => item.unit))].map((unit) => (
//                   <Scatter
//                     key={unit}
//                     name={unit}
//                     data={chartData.filter(item => item.unit === unit)}
//                     fill={getUnitColor(unit)}
//                     shape="circle"
//                     legendType="circle"
//                   >
//                     {
//                       chartData
//                         .filter(item => item.unit === unit)
//                         .map((entry, index) => (
//                           <circle
//                             key={index}
//                             cx={0}
//                             cy={0}
//                             r={Math.sqrt(getBubbleSize(entry.users))}
//                             fill={getUnitColor(unit)}
//                             fillOpacity={0.6}
//                           />
//                         ))
//                     }
//                   </Scatter>
//                 ))
//               }
//             </ScatterChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </Card>
//   );
// }; 