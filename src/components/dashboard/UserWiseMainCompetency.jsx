// import React, { useState } from 'react';
// import CompetencyFilters from './CompetencyFilters';

// function UserWiseMainCompetency() {
//   const [filters, setFilters] = useState({
//     regions: [],
//     units: []
//   });

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//     // Here you can add your data fetching logic based on the new filters
//     console.log('Filters changed:', newFilters);
//   };

//   return (
//     <div className="flex-1 flex flex-col">
//       {/* Header */}
//       <header className="bg-white border-b shadow-sm p-4">
//         <h1 className="text-xl font-bold text-indigo-600">Performance Report</h1>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 p-6 overflow-hidden">
//         <div className="grid grid-cols-1 gap-6">
//           <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg shadow-lg p-6 border border-indigo-100">
//             {/* Common Filters */}
//             <div className="mb-6">
//               <CompetencyFilters onFilterChange={handleFilterChange} />
//             </div>
            
//             {/* Table Content */}
//             <div className="flex items-center justify-center h-[600px] text-indigo-600">
//               <p>Please select filters to view data</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default UserWiseMainCompetency; 