// src/pages/LoginPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../utils/axios';

const LoginPage = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().required('請輸入帳號'),
      password: Yup.string().required('請輸入密碼')
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post('/api/auth/login', values);
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert(error.response?.data?.message || '登入失敗');
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] dark:bg-gray-900 font-inter">
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-800 dark:text-white">
            系統登入
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                帳號
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                  formik.touched.username && formik.errors.username
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? '登入中...' : '登入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;