// src/pages/system/ModuleManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { PencilIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Pagination from '../../components/common/Pagination';

const ModuleManagement = () => {
  const [modules, setModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [searchParams, setSearchParams] = useState({
    moduleName: '',
    codeNo: ''
  });
  const [formData, setFormData] = useState({
    moduleName: '',
    codeNo: '',
    parentId: null,
    sortOrder: 0,
    status: 'Active',
    componentName: '',
    componentPath: ''
  });
  const [parentModules, setParentModules] = useState([]);

  useEffect(() => {
    fetchModules();
    fetchParentModules();
  }, []);

  const buildModuleTree = (modules) => {
    const modulesByParent = modules.reduce((acc, module) => {
      const parentId = module.ParentId || 'root';
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(module);
      return acc;
    }, {});
  
    Object.keys(modulesByParent).forEach(parentId => {
      modulesByParent[parentId].sort((a, b) => a.SortOrder - b.SortOrder);
    });
  
    const result = [];
    
    if (modulesByParent['root']) {
      modulesByParent['root'].forEach(rootModule => {
        result.push(rootModule);
        const addChildren = (parentId) => {
          if (modulesByParent[parentId]) {
            modulesByParent[parentId].forEach(childModule => {
              result.push(childModule);
              addChildren(childModule.Id);
            });
          }
        };
        addChildren(rootModule.Id);
      });
    }
  
    return result;
  };

  const fetchModules = async (searchCriteria = null) => {
    try {
      let url = '/api/modules';
      if (searchCriteria) {
        const params = new URLSearchParams();
        if (searchCriteria.moduleName?.trim()) {
          params.append('moduleName', searchCriteria.moduleName.trim());
        }
        if (searchCriteria.codeNo?.trim()) {
          params.append('codeNo', searchCriteria.codeNo.trim());
        }
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      const response = await axios.get(url);
      const sortedModules = buildModuleTree(response.data);
      setModules(sortedModules);
      setCurrentPage(1); // Reset to first page after fetching new data
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const getPaginatedData = () => {
    if (itemsPerPage === 'All') return modules;
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return modules.slice(indexOfFirstItem, indexOfLastItem);
  };

  const fetchParentModules = async () => {
    try {
      const response = await axios.get('/api/modules/parents');
      setParentModules(response.data);
    } catch (error) {
      console.error('Error fetching parent modules:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedModuleName = searchParams.moduleName.trim();
    const trimmedCodeNo = searchParams.codeNo.trim();
    
    if (!trimmedModuleName && !trimmedCodeNo) {
      await fetchModules();
    } else {
      await fetchModules({
        moduleName: trimmedModuleName,
        codeNo: trimmedCodeNo
      });
    }
    setIsSearchModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/modules/${moduleToDelete.Id}`);
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
      fetchModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert(error.response?.data?.message || '刪除失敗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        moduleName: formData.moduleName,
        codeNo: formData.codeNo,
        parentId: formData.parentId,
        sortOrder: formData.sortOrder,
        status: formData.status,
        componentName: formData.componentName,
        componentPath: formData.componentPath
      };

      if (editingModule) {
        await axios.put(`/api/modules/${editingModule.Id}`, submitData);
      } else {
        await axios.post('/api/modules', submitData);
      }

      setIsModalOpen(false);
      setEditingModule(null);
      setFormData({
        moduleName: '',
        codeNo: '',
        parentId: null,
        sortOrder: 0,
        status: 'Active',
        componentName: '',
        componentPath: ''
      });
      fetchModules();
    } catch (error) {
      console.error('Error saving module:', error);
      alert(error.response?.data?.message || '儲存失敗');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-gray-900 p-6">
      <div className="mx-auto" style={{ width: '90%' }}>
        {/* Header section with title and buttons */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">模組管理</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              搜尋
            </button>
            <button
              onClick={() => {
                setEditingModule(null);
                setFormData({
                  moduleName: '',
                  codeNo: '',
                  parentId: null,
                  sortOrder: 0,
                  status: 'Active',
                  componentName: '',
                  componentPath: ''
                });
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新增模組
            </button>
          </div>
        </div>

        {/* Table with Pagination */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">編號</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">模組名稱</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">代碼</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">上層模組</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">組件名稱</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">組件路徑</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">排序</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getPaginatedData().map((module) => (
                  <tr key={module.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{module.Id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div style={{ marginLeft: `${module.ParentId ? '1.5rem' : '0'}` }}>
                        {module.ModuleName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{module.CodeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {module.ParentModuleName || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {module.ComponentName || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {module.ComponentPath || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{module.SortOrder}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        module.Status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {module.Status === 'Active' ? '有效' : '無效'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingModule(module);
                            setFormData({
                              moduleName: module.ModuleName,
                              codeNo: module.CodeNo,
                              parentId: module.ParentId,
                              sortOrder: module.SortOrder,
                              status: module.Status,
                              componentName: module.ComponentName || '',
                              componentPath: module.ComponentPath || ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setModuleToDelete(module);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Component */}
          <Pagination
            totalItems={modules.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Modals... (其他 Modal 部分保持不變) */}
        
      </div>
    </div>
  );
};

export default ModuleManagement;