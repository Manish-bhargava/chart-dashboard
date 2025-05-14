import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
<<<<<<< HEAD
      <Route path="/dashboard/*" element={<Dashboard />} />
=======
    
>>>>>>> 48e6ff0 (resolve cors iisue)
    </Routes>
  );
}

export default App;