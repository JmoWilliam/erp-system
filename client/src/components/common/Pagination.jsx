// src/components/common/Pagination.jsx
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];
  
  // 生成要顯示的頁碼
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div className="flex items-center">
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(e.target.value === 'All' ? 'All' : Number(e.target.value))}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                   text-sm text-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:outline-none 
                   focus:ring-indigo-500 mr-4"
        >
          <option value={10}>10 筆/頁</option>
          <option value={20}>20 筆/頁</option>
          <option value={30}>30 筆/頁</option>
          <option value={50}>50 筆/頁</option>
          <option value="All">全部</option>
        </select>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          共 {totalItems} 筆資料
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* 上一頁按鈕 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || itemsPerPage === 'All'}
          className={`relative inline-flex items-center p-2 rounded-md 
                    ${currentPage === 1 || itemsPerPage === 'All'
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {/* 頁碼按鈕 */}
        {itemsPerPage !== 'All' && pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                      ${currentPage === number
                        ? 'z-10 bg-indigo-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
          >
            {number}
          </button>
        ))}

        {/* 下一頁按鈕 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || itemsPerPage === 'All'}
          className={`relative inline-flex items-center p-2 rounded-md
                    ${currentPage === totalPages || itemsPerPage === 'All'
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;