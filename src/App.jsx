import React from 'react';
import TabsPage from './pages/TabsPage';
import LoginPage from './pages/LoginPage';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
function App() {
  return (
    <Routes>
{/* <Route path="/" element={<LoginPage />} /> */}
{/* <Route path="/tabs" element={<TabsPage />} /> */}
<Route path="/" element={<Dashboard />} />


</Routes>
   
   
  );
}

export default App;