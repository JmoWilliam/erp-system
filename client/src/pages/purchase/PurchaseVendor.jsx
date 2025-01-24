// src/pages/purchase/PurchaseVendor.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { 
  PencilIcon, 
  PlusIcon, 
  TrashIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import Pagination from '../../components/common/Pagination';

const PurchaseVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [searchParams, setSearchParams] = useState({
    vendorCode: '',
    companyName: '',
    uniformNo: ''
  });

  const [formData, setFormData] = useState({
    vendorCode: '',
    companyName: '',
    vendorType: '',
    uniformNo: '',
    regionCode: '',
    areaCode: '',
    tel1: '',
    tel2: '',
    faxNo: '',
    email: '',
    contactPerson: '',
    contactPerson2: '',
    address1: '',
    address2: '',
    reviewStatus: '1',
    startDate: '',
    capital: '',
    employeeCount: '',
    transactionMethod: '1',
    transactionType: '',
    firstTransaction: '',
    lastTransaction: '',
    paymentMethod: '1',
    paymentTerms: '',
    pricingTerms: '',
    bankCode: '',
    bankAccount: '',
    ticketType: '1',
    demandNote: '1',
    abcClass: '',
    transactionGrade: '',
    qualityGrade: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async (searchCriteria = null) => {
    try {
      let url = '/api/vendors';
      if (searchCriteria) {
        const params = new URLSearchParams();
        if (searchCriteria.vendorCode?.trim()) {
          params.append('vendorCode', searchCriteria.vendorCode.trim());
        }
        if (searchCriteria.companyName?.trim()) {
          params.append('companyName', searchCriteria.companyName.trim());
        }
        if (searchCriteria.uniformNo?.trim()) {
          params.append('uniformNo', searchCriteria.uniformNo.trim());
        }
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      const response = await axios.get(url);
      setVendors(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const getPaginatedData = () => {
    if (itemsPerPage === 'All') return vendors;
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return vendors.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchVendors(searchParams);
    setIsSearchModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/vendors/${vendorToDelete.Id}`);
      setIsDeleteModalOpen(false);
      setVendorToDelete(null);
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert(error.response?.data?.message || '刪除失敗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await axios.put(`/api/vendors/${editingVendor.Id}`, formData);
      } else {
        await axios.post('/api/vendors', formData);
      }

      setIsModalOpen(false);
      setEditingVendor(null);
      setFormData({
        vendorCode: '',
        companyName: '',
        vendorType: '',
        uniformNo: '',
        regionCode: '',
        areaCode: '',
        tel1: '',
        tel2: '',
        faxNo: '',
        email: '',
        contactPerson: '',
        contactPerson2: '',
        address1: '',
        address2: '',
        reviewStatus: '1',
        startDate: '',
        capital: '',
        employeeCount: '',
        transactionMethod: '1',
        transactionType: '',
        firstTransaction: '',
        lastTransaction: '',
        paymentMethod: '1',
        paymentTerms: '',
        pricingTerms: '',
        bankCode: '',
        bankAccount: '',
        ticketType: '1',
        demandNote: '1',
        abcClass: '',
        transactionGrade: '',
        qualityGrade: '',
        status: 'Active'
      });
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert(error.response?.data?.message || '儲存失敗');
    }
  };

  const renderFormField = (label, name, type = 'text', options = null) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {options ? (
        <select
          value={formData[name]}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={formData[name]}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-gray-900 p-6">
      <div className="mx-auto" style={{ width: '90%' }}>
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">供應商資料維護</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              搜尋
            </button>
            <button
              onClick={() => {
                setEditingVendor(null);
                setFormData({
                  vendorCode: '',
                  companyName: '',
                  vendorType: '',
                  uniformNo: '',
                  regionCode: '',
                  areaCode: '',
                  tel1: '',
                  tel2: '',
                  faxNo: '',
                  email: '',
                  contactPerson: '',
                  contactPerson2: '',
                  address1: '',
                  address2: '',
                  reviewStatus: '1',
                  startDate: '',
                  capital: '',
                  employeeCount: '',
                  transactionMethod: '1',
                  transactionType: '',
                  firstTransaction: '',
                  lastTransaction: '',
                  paymentMethod: '1',
                  paymentTerms: '',
                  pricingTerms: '',
                  bankCode: '',
                  bankAccount: '',
                  ticketType: '1',
                  demandNote: '1',
                  abcClass: '',
                  transactionGrade: '',
                  qualityGrade: '',
                  status: 'Active'
                });
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新增供應商
            </button>
          </div>
        </div>

        {/* Table section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">供應商代號</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">公司全名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">統一編號</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">負責人</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">聯絡電話</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getPaginatedData().map((vendor) => (
                  <tr key={vendor.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.VendorCode}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.CompanyName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.UniformNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.ContactPerson}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.Tel1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        vendor.Status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {vendor.Status === 'Active' ? '有效' : '無效'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingVendor(vendor);
                            setFormData({
                              vendorCode: vendor.VendorCode,
                              companyName: vendor.CompanyName,
                              vendorType: vendor.VendorType || '',
                              uniformNo: vendor.UniformNo || '',
                              regionCode: vendor.RegionCode || '',
                              areaCode: vendor.AreaCode || '',
                              tel1: vendor.Tel1 || '',
                              tel2: vendor.Tel2 || '',
                              faxNo: vendor.FaxNo || '',
                              email: vendor.Email || '',
                              contactPerson: vendor.ContactPerson || '',
                              contactPerson2: vendor.ContactPerson2 || '',
                              address1: vendor.Address1 || '',
                              address2: vendor.Address2 || '',
                              reviewStatus: vendor.ReviewStatus || '1',
                              startDate: vendor.StartDate || '',
                              capital: vendor.Capital || '',
                              employeeCount: vendor.EmployeeCount || '',
                              transactionMethod: vendor.TransactionMethod || '1',
                              transactionType: vendor.TransactionType || '',
                              firstTransaction: vendor.FirstTransaction || '',
                              lastTransaction: vendor.LastTransaction || '',
                              paymentMethod: vendor.PaymentMethod || '1',
                              paymentTerms: vendor.PaymentTerms || '',
                              pricingTerms: vendor.PricingTerms || '',
                              bankCode: vendor.BankCode || '',
                              bankAccount: vendor.BankAccount || '',
                              ticketType: vendor.TicketType || '1',
                              demandNote: vendor.DemandNote || '1',
                              abcClass: vendor.AbcClass || '',
                              transactionGrade: vendor.TransactionGrade || '',
                              qualityGrade: vendor.QualityGrade || '',
                              status: vendor.Status
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setVendorToDelete(vendor);
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
          
          {/* Pagination */}
          <Pagination
            totalItems={vendors.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Edit/Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                {editingVendor ? '編輯供應商' : '新增供應商'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('供應商代號', 'vendorCode')}
                {renderFormField('公司全名', 'companyName')}
                {renderFormField('廠商分類', 'vendorType')}
                {renderFormField('統一編號', 'uniformNo')}
                {renderFormField('國家別', 'regionCode')}
                {renderFormField('地區別', 'areaCode')}
                {renderFormField('電話(一)', 'tel1')}
                {renderFormField('電話(二)', 'tel2')}
                {renderFormField('傳真號碼', 'faxNo')}
                {renderFormField('Email', 'email', 'email')}
                {renderFormField('負責人', 'contactPerson')}
                {renderFormField('聯絡人', 'contactPerson2')}
                {renderFormField('聯絡地址(一)', 'address1')}
                {renderFormField('聯絡地址(二)', 'address2')}
                {renderFormField('核准狀況', 'reviewStatus', 'select', [
                  { value: '1', label: '已核准' },
                  { value: '2', label: '尚待核准' },
                  { value: '3', label: '不准交易' }
                ])}
                {renderFormField('開業日', 'startDate')}
                {renderFormField('資本額', 'capital', 'number')}
                {renderFormField('員工人數', 'employeeCount', 'number')}
                {renderFormField('發票聯發方式', 'transactionMethod', 'select', [
                  { value: '1', label: '郵寄' },
                  { value: '2', label: 'FAX' },
                  { value: '3', label: 'EDI' },
                  { value: '4', label: 'E-MAIL' }
                ])}
                {renderFormField('交易幣別', 'transactionType')}
                {renderFormField('初次交易', 'firstTransaction')}
                {renderFormField('最近交易', 'lastTransaction')}
                {renderFormField('付款方式', 'paymentMethod', 'select', [
                  { value: '1', label: '現金' },
                  { value: '2', label: '電匯' },
                  { value: '3', label: '支票' },
                  { value: '4', label: '其他' }
                ])}
                {renderFormField('付款條件', 'paymentTerms')}
                {renderFormField('價格條件', 'pricingTerms')}
                {renderFormField('庫款銀行', 'bankCode')}
                {renderFormField('庫款帳號', 'bankAccount')}
                {renderFormField('票據寄領', 'ticketType', 'select', [
                  { value: '1', label: '郵寄' },
                  { value: '2', label: '自領' },
                  { value: '3', label: '其他' }
                ])}
                {renderFormField('發票聯數', 'demandNote', 'select', [
                  { value: '1', label: '二聯式' },
                  { value: '2', label: '三聯式' }
                ])}
                {renderFormField('ABC等級', 'abcClass')}
                {renderFormField('交貨評等', 'transactionGrade')}
                {renderFormField('品質評等', 'qualityGrade')}
                {renderFormField('狀態', 'status', 'select', [
                  { value: 'Active', label: '有效' },
                  { value: 'Inactive', label: '無效' }
                ])}

                <div className="col-span-2 flex justify-end space-x-4 mt-6">
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

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">確認刪除</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                確定要刪除供應商 "{vendorToDelete?.CompanyName}" 嗎？
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Modal */}
        {isSearchModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                搜尋供應商
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">供應商代號</label>
                  <input
                    type="text"
                    value={searchParams.vendorCode}
                    onChange={(e) => setSearchParams({...searchParams, vendorCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">公司全名</label>
                  <input
                    type="text"
                    value={searchParams.companyName}
                    onChange={(e) => setSearchParams({...searchParams, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">統一編號</label>
                  <input
                    type="text"
                    value={searchParams.uniformNo}
                    onChange={(e) => setSearchParams({...searchParams, uniformNo: e.target.value})}
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
                      setSearchParams({
                        vendorCode: '',
                        companyName: '',
                        uniformNo: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                             rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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

export default PurchaseVendor;