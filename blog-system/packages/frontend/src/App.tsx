import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// 布局组件
import Layout from './components/Layout/Layout';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// 页面组件
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// 上下文和 Hooks
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// 样式
import './styles/globals.css';

// 创建 Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Header />
              
              <main className="flex-1">
                <Routes>
                  {/* 公开路由 */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/posts/:slug" element={<PostDetailPage />} />
                  <Route path="/categories/:slug" element={<CategoryPage />} />
                  <Route path="/tags/:slug" element={<TagPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* 受保护的路由 */}
                  <Route 
                    path="/create" 
                    element={
                      <ProtectedRoute>
                        <CreatePostPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/edit/:id" 
                    element={
                      <ProtectedRoute>
                        <EditPostPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 404 页面 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              
              <Footer />
            </div>
            
            {/* 全局提示 */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
      
      {/* 开发工具 */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App; 