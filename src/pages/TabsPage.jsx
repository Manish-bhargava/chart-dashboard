<<<<<<< HEAD
import React from "react";
import { useNavigate } from "react-router-dom";

const TabsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-white mb-12">Dashboard</h1>

      <div className="flex gap-6">
        {/* Chart View Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-4 rounded-xl text-lg font-semibold bg-white text-indigo-600 hover:bg-gray-100 transition"
        >
          Chart View
        </button>

        {/* Table View Button */}
        <button
          onClick={() => navigate("/table")}
          className="px-8 py-4 rounded-xl text-lg font-semibold bg-white text-indigo-600 hover:bg-gray-100 transition"
        >
          Table View
        </button>
      </div>
    </div>
  );
};

export default TabsPage;
=======
// import React from "react";
// import { useNavigate } from "react-router-dom";

// const TabsPage = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 flex flex-col items-center justify-center p-6">
//       <h1 className="text-4xl font-bold text-white mb-12">Dashboard</h1>

//       <div className="flex gap-6">
//         {/* Chart View Button */}
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="px-8 py-4 rounded-xl text-lg font-semibold bg-white text-indigo-600 hover:bg-gray-100 transition"
//         >
//           Chart View
//         </button>

//         {/* Table View Button */}
//         <button
//           onClick={() => navigate("/table")}
//           className="px-8 py-4 rounded-xl text-lg font-semibold bg-white text-indigo-600 hover:bg-gray-100 transition"
//         >
//           Table View
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TabsPage;
>>>>>>> 48e6ff0 (resolve cors iisue)
