// src/pages/system/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { PencilIcon, UserPlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Pagination from '../../components/common/Pagination';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchParams, setSearchParams] = useState({
    account: '',
    name: ''
  });
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    passwordConfirm: '',
    name: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (searchCriteria = null) => {
    try {
      let url = '/api/users';
      if (searchCriteria) {
        const params = new URLSearchParams();
        if (searchCriteria.account?.trim()) {
          params.append('account', searchCriteria.account.trim());
        }
        if (searchCriteria.name?.trim()) {
          params.append('name', searchCriteria.name.trim());
        }
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      console.log('Fetching URL:', url);
      const response = await axios.get(url);
      console.log('Response data:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getPaginatedData = (data) => {
    if (itemsPerPage === 'All') return data;
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const paginatedData = getPaginatedData(users); // 或 modules 或 roles

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // 檢查是否有輸入搜尋條件
    const trimmedAccount = searchParams.account.trim();
    const trimmedName = searchParams.name.trim();
    
    if (!trimmedAccount && !trimmedName) {
      await fetchUsers(); // 如果沒有搜尋條件，獲取所有用戶
    } else {
      await fetchUsers({
        account: trimmedAccount,
        name: trimmedName
      });
    }
    setIsSearchModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${userToDelete.Id}`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.passwordConfirm) {
        alert('密碼不一致');
        return;
      }

      if (editingUser) {
        await axios.put(`/api/users/${editingUser.Id}`, formData);
      } else {
        await axios.post('/api/users', formData);
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        account: '',
        password: '',
        passwordConfirm: '',
        name: '',
        status: 'Active'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || '儲存失敗');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-gray-900 p-6">
      <div className="mx-auto" style={{ width: '80%' }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">使用者管理</h1>
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
                setEditingUser(null);
                setFormData({
                  account: '',
                  password: '',
                  passwordConfirm: '',
                  name: '',
                  status: 'Active'
                });
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              新增使用者
            </button>
          </div>
        </div>

        {/* 使用者列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">編號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">帳號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.Id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.Account}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.Name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                      user.Status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {user.Status === 'Active' ? '有效' : '無效'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            account: user.Account,
                            password: '',
                            passwordConfirm: '',
                            name: user.Name,
                            status: user.Status
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
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

        <Pagination
          totalItems={users.length} // 或 modules.length 或 roles.length
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1); // 重置到第一頁
          }}
        />

        {/* 編輯/新增 Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                {editingUser ? '編輯使用者' : '新增使用者'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">帳號</label>
                  <input
                    type="text"
                    value={formData.account}
                    onChange={(e) => setFormData({...formData, account: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密碼</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">確認密碼</label>
                  <input
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名稱</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                確定要刪除使用者 "{userToDelete?.Name}" 嗎？
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
                搜尋使用者
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">帳號</label>
                  <input
                    type="text"
                    value={searchParams.account}
                    onChange={(e) => setSearchParams({...searchParams, account: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名稱</label>
                  <input
                    type="text"
                    value={searchParams.name}
                    onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
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
                      setSearchParams({ account: '', name: '' });
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

export default UserManagement;