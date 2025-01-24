// src/pages/system/RoleManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Pagination from '../../components/common/Pagination';
import { 
  PencilIcon, 
  UserPlusIcon, 
  TrashIcon, 
  UserGroupIcon,
  KeyIcon 
} from '@heroicons/react/24/outline';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    roleName: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const getPaginatedData = (data) => {
    if (itemsPerPage === 'All') return data;
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  // 在渲染表格數據時使用分頁數據
  const paginatedData = getPaginatedData(roles); // 或 modules 或 roles

  const fetchRoleUsers = async (roleId) => {
    try {
      const response = await axios.get(`/api/roles/${roleId}/users`);
      setUsers(response.data);
      setSelectedUsers(response.data
        .filter(user => user.isSelected)
        .map(user => user.Id)
      );
    } catch (error) {
      console.error('Error fetching role users:', error);
    }
  };

  const fetchRoleModules = async (roleId) => {
    try {
      const response = await axios.get(`/api/roles/${roleId}/modules`);
      setModules(response.data);
      const selectedIds = [];
      const collectSelectedIds = (moduleList) => {
        moduleList.forEach(module => {
          if (module.isSelected) {
            selectedIds.push(module.Id);
          }
          if (module.children?.length) {
            collectSelectedIds(module.children);
          }
        });
      };
      collectSelectedIds(response.data);
      setSelectedModules(selectedIds);
    } catch (error) {
      console.error('Error fetching role modules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await axios.put(`/api/roles/${editingRole.Id}`, formData);
      } else {
        await axios.post('/api/roles', formData);
      }
      setIsModalOpen(false);
      setEditingRole(null);
      setFormData({ roleName: '', status: 'Active' });
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert(error.response?.data?.message || '儲存失敗');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/roles/${roleToDelete.Id}`);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      alert(error.response?.data?.message || '刪除失敗');
    }
  };

  const handleUpdateRoleUsers = async () => {
    try {
      await axios.put(`/api/roles/${selectedRoleId}/users`, {
        userIds: selectedUsers
      });
      setIsUserModalOpen(false);
      alert('使用者更新成功');
    } catch (error) {
      console.error('Error updating role users:', error);
      alert(error.response?.data?.message || '更新失敗');
    }
  };

  const handleUpdateRoleModules = async () => {
    try {
      await axios.put(`/api/roles/${selectedRoleId}/modules`, {
        moduleIds: selectedModules
      });
      setIsPermissionModalOpen(false);
      alert('權限更新成功');
    } catch (error) {
      console.error('Error updating role modules:', error);
      alert(error.response?.data?.message || '更新失敗');
    }
  };

  // 渲染模組樹的組件
  const RenderModuleTree = ({ modules }) => {
    return (
      <div className="space-y-1">
        {modules.map(module => (
          <div key={module.Id}>
            <div 
              className={`
                flex items-center p-2 rounded-lg
                ${module.ParentId ? 'ml-6' : ''}
                ${module.isLeaf ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'font-medium text-gray-700 dark:text-gray-300'}
              `}
            >
              <div className="flex items-center flex-1">
                {module.isLeaf ? (
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(module.Id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedModules([...selectedModules, module.Id]);
                      } else {
                        setSelectedModules(selectedModules.filter(id => id !== module.Id));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded 
                             cursor-pointer mr-3"
                  />
                ) : (
                  <div className="mr-7">
                    <svg 
                      className="h-4 w-4 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
                <span className={`
                  text-sm
                  ${module.isLeaf ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}
                `}>
                  {module.ModuleName}
                </span>
              </div>
            </div>
            {module.children?.length > 0 && (
              <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4">
                <RenderModuleTree modules={module.children} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-gray-900 p-6">
      <div className="mx-auto" style={{ width: '80%' }}>
        {/* 標題和新增按鈕 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">角色管理</h1>
          <button
            onClick={() => {
              setEditingRole(null);
              setFormData({ roleName: '', status: 'Active' });
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            新增角色
          </button>
        </div>

        {/* 角色列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">編號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {roles.map((role) => (
                <tr key={role.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{role.Id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{role.RoleName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                      role.Status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {role.Status === 'Active' ? '有效' : '無效'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setEditingRole(role);
                          setFormData({
                            roleName: role.RoleName,
                            status: role.Status
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="編輯"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRoleId(role.Id);
                          fetchRoleUsers(role.Id);
                          setIsUserModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="使用者設定"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRoleId(role.Id);
                          fetchRoleModules(role.Id);
                          setIsPermissionModalOpen(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="權限設定"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setRoleToDelete(role);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="刪除"
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
          totalItems={roles.length} // 或 modules.length 或 roles.length
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
                {editingRole ? '編輯角色' : '新增角色'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">角色名稱</label>
                  <input
                    type="text"
                    value={formData.roleName}
                    onChange={(e) => setFormData({...formData, roleName: e.target.value})}
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">確認刪除</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                確定要刪除角色 "{roleToDelete?.RoleName}" 嗎？
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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

        {/* 角色使用者 Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                角色使用者設定
              </h2>
              <div className="max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.Id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.Id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.Id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.Id));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-sm text-gray-700 dark:text-gray-200">
                      {user.Account} - {user.Name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateRoleUsers}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 角色權限 Modal */}
        {isPermissionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                角色權限設定
              </h2>
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  勾選下列功能以設定角色權限
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                <RenderModuleTree modules={modules} />
              </div>
              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateRoleModules}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;