import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintsList from './pages/ComplaintsList';
import ComplaintDetails from './pages/ComplaintDetails';
import RaiseComplaint from './pages/RaiseComplaint';
import NoticeBoard from './pages/NoticeBoard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/resident" replace />} />
            
            {/* Resident Routes */}
            <Route path="/resident" element={<ResidentDashboard />} />
            <Route path="/resident/complaints" element={<ComplaintsList role="RESIDENT" />} />
            <Route path="/resident/complaints/:id" element={<ComplaintDetails role="RESIDENT" />} />
            <Route path="/resident/raise-complaint" element={<RaiseComplaint />} />
            <Route path="/resident/notices" element={<NoticeBoard role="RESIDENT" />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<ComplaintsList role="ADMIN" />} />
            <Route path="/admin/complaints/:id" element={<ComplaintDetails role="ADMIN" />} />
            <Route path="/admin/notices" element={<NoticeBoard role="ADMIN" />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
