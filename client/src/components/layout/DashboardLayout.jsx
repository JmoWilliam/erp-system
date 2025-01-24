// src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  User,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import axios from '../../utils/axios';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMenuItem = (itemId) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(itemId)) {
      newExpandedItems.delete(itemId);
    } else {
      newExpandedItems.add(itemId);
    }
    setExpandedItems(newExpandedItems);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/modules/navigation');
      console.log('Menu structure:', JSON.stringify(response.data, null, 2));
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleMenuClick = async (item, hasChildren, moduleId) => {
    if (hasChildren) {
      toggleMenuItem(moduleId);
    } else {
      try {
        setIsLoading(true);
        const parentModule = item.ParentId ? 
          menuItems.find(m => m.Id === item.ParentId) : null;
        
        let path;
        if (parentModule) {
          const parentCode = parentModule.CodeNo.toLowerCase();
          const currentCode = item.CodeNo.toLowerCase();
          path = `/dashboard/${parentCode}/${currentCode}`;
        } else {
          path = `/dashboard/sys/${item.CodeNo.toLowerCase()}`;
        }
        
        console.log('Navigating to:', path);
        await navigate(path);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderMenuItem = (item, level = 0) => {
    const moduleId = item.Id;
    const moduleName = item.ModuleName;
    const hasChildren = item.children?.length > 0;
    const isExpanded = expandedItems.has(moduleId);
    const paddingLeft = level * 1;

    return (
      <div key={moduleId} className="w-full font-inter">
        <div
          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } ${isLoading ? 'opacity-50' : ''}`}
          style={{ paddingLeft: isCollapsed ? '1rem' : `${1 + paddingLeft}rem` }}
          onClick={() => handleMenuClick(item, hasChildren, moduleId)}
        >
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <>
                <span className="text-sm text-gray-100">{moduleName}</span>
                {isLoading && (
                  <span className="inline-block animate-spin">⋯</span>
                )}
              </>
            )}
          </div>
          {!isCollapsed && hasChildren && (
            <span className="text-gray-400">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && !isCollapsed && (
          <div>
            {item.children.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          {!isCollapsed && (
            <img 
              src="/images/logo.png" 
              alt="川達" 
              className="h-12 w-12 object-contain"
            />
          )}
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <MenuIcon size={20} />
          </button>
        </div>
        {/* Menu */}
        <div className="py-4">
          {Array.isArray(menuItems) && menuItems.map((item) => renderMenuItem(item, 0))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 font-inter">
          <div></div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Bell className="h-5 w-5 text-gray-800 dark:text-white" />
            </button>
            <div className="relative">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="h-5 w-5 text-gray-800 dark:text-white" />
                <span className="text-gray-800 dark:text-white font-medium">Admin</span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </div>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/dashboard/change-password');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    修改密碼
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#F4F7FE] dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;