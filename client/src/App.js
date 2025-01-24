// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from './utils/axios';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import PrivateRoute from './components/common/PrivateRoute';

// 預設組件映射表
const staticComponents = {
  UserManagement: React.lazy(() => import('./pages/system/UserManagement')),
  RoleManagement: React.lazy(() => import('./pages/system/RoleManagement')),
  ModuleManagement: React.lazy(() => import('./pages/system/ModuleManagement')),
  PurchaseVendor: React.lazy(() => import('./pages/purchase/PurchaseVendor'))
};

const App = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get('/api/modules/menu-routes');
      console.log('Fetched routes:', response.data);
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const renderDynamicRoutes = (routes) => {
    return routes.map(route => {
      // 首先檢查是否有預定義的靜態組件
      const StaticComponent = staticComponents[route.componentName];
      
      // 如果有靜態組件使用靜態組件，否則使用動態導入
      const Component = StaticComponent || React.lazy(() => {
        console.log('Dynamic loading component:', `./${route.componentPath}`);
        return import(`./${route.componentPath}`);
      });

      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <React.Suspense 
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
                </div>
              }
            >
              <Component />
            </React.Suspense>
          }
        />
      );
    });
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          {/* Dashboard Home */}
          <Route index element={<DashboardHome />} />

          {/* Dynamic Module Routes */}
          {renderDynamicRoutes(routes)}

          {/* 添加任何其他靜態路由 */}
          {/* 例如需要額外的固定路由可以在這裡添加 */}
        </Route>

        {/* 404 Route */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-400 mb-4">找不到頁面</p>
              <button 
                onClick={() => window.history.back()}
                className="text-blue-500 hover:text-blue-400"
              >
                返回上一頁
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;