import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { PencilIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const FunctionManagement = () => {
  const [functions, setFunctions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState(null);
  const [functionToDelete, setFunctionToDelete] = useState(null);
  const [searchParams, setSearchParams] = useState({
    functionName: '',
    codeNo: ''
  });
  const [formData, setFormData] = useState({
    functionName: '',
    codeNo: '',
    moduleId: '',
    sortOrder: 0,
    status: 'Active'
  });
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchFunctions();
    fetchModules();
  }, []);

  const fetchFunctions = async (searchCriteria = null) => {
    try {
      let url = '/api/functions';
      if (searchCriteria) {
        const params = new URLSearchParams();
        if (searchCriteria.functionName?.trim()) {
          params.append('functionName', searchCriteria.functionName.trim());
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
      setFunctions(response.data);
    } catch (error) {
      console.error('Error fetching functions:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedFunctionName = searchParams.functionName.trim();
    const trimmedCodeNo = searchParams.codeNo.trim();
    
    if (!trimmedFunctionName && !trimmedCodeNo) {
      await fetchFunctions();
    } else {
      await fetchFunctions({
        functionName: trimmedFunctionName,
        codeNo: trimmedCodeNo
      });
    }
    setIsSearchModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/functions/${functionToDelete.Id}`);
      setIsDeleteModalOpen(false);
      setFunctionToDelete(null);
      fetchFunctions();
    } catch (error) {
      console.error('Error deleting function:', error);
      alert(error.response?.data?.message || '刪除失敗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFunction) {
        await axios.put(`/api/functions/${editingFunction.Id}`, formData);
      } else {
        await axios.post('/api/functions', formData);
      }

      setIsModalOpen(false);
      setEditingFunction(null);
      setFormData({
        functionName: '',
        codeNo: '',
        moduleId: '',
        sortOrder: 0,
        status: 'Active'
      });
      fetchFunctions();
    } catch (error) {
      console.error('Error saving function:', error);
      alert(error.response?.data?.message || '儲存失敗');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-gray-900 p-6">
      <div className="mx-auto" style={{ width: '80%' }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">功能管理</h1>
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
                setEditingFunction(null);
                setFormData({
                  functionName: '',
                  codeNo: '',
                  moduleId: '',
                  sortOrder: 0,
                  status: 'Active'
                });
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新增功能
            </button>
          </div>
        </div>

        {/* 功能列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">編號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">功能名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">代碼</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">所屬模組</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">排序</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {functions.map((func) => (
                <tr key={func.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{func.Id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{func.FunctionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{func.CodeNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{func.ModuleName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{func.SortOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                      func.Status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {func.Status === 'Active' ? '有效' : '無效'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setEditingFunction(func);
                          setFormData({
                            functionName: func.FunctionName,
                            codeNo: func.CodeNo,
                            moduleId: func.ModuleId,
                            sortOrder: func.SortOrder,
                            status: func.Status
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFunctionToDelete(func);
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

        {/* 編輯/新增 Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                {editingFunction ? '編輯功能' : '新增功能'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">功能名稱</label>
                  <input
                    type="text"
                    value={formData.functionName}
                    onChange={(e) => setFormData({...formData, functionName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">代碼</label>
                  <input
                    type="text"
                    value={formData.codeNo}
                    onChange={(e) => setFormData({...formData, codeNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">所屬模組</label>
                  <select
                    value={formData.moduleId}
                    onChange={(e) => setFormData({...formData, moduleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">請選擇模組</option>
                    {modules.map(module => (
                      <option key={module.Id} value={module.Id}>
                        {module.ModuleName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">排序</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">狀態</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Active">有效</option>
                    <option value="Inactive">無效</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                             rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    儲存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 刪除確認 Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-medium mb-4">確認刪除</h3>
              <p className="text-gray-600 mb-6">
                確定要刪除功能 "{functionToDelete?.FunctionName}" 嗎？
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 搜尋 Modal */}
        {isSearchModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                搜尋功能
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">功能名稱</label>
                  <input
                    type="text"
                    value={searchParams.functionName}
                    onChange={(e) => setSearchParams({...searchParams, functionName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">代碼</label>
                  <input
                    type="text"
                    value={searchParams.codeNo}
                    onChange={(e) => setSearchParams({...searchParams, codeNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      setSearchParams({ functionName: '', codeNo: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                             rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    搜尋
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionManagement;