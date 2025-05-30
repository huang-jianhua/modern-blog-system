import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            🚀 现代博客系统
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            欢迎来到我们的现代化博客平台！
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              系统特性
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left">
                <h3 className="font-semibold text-gray-700 mb-2">✨ 现代化设计</h3>
                <p className="text-gray-600">响应式设计，支持深色模式</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-700 mb-2">🔍 智能搜索</h3>
                <p className="text-gray-600">全文搜索，标签分类</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-700 mb-2">📝 富文本编辑</h3>
                <p className="text-gray-600">Markdown支持，实时预览</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-700 mb-2">💬 评论系统</h3>
                <p className="text-gray-600">实时评论，用户互动</p>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                开始使用
              </button>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-gray-500">
            <p>部署状态: ✅ 已成功部署到 Cloudflare Pages</p>
            <p>构建时间: {new Date().toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 