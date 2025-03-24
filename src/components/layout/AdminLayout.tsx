import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { darkMode } = useTheme();
  
  // Navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Products', path: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Orders', path: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-dark text-light' : 'bg-gray-100 text-gray-800'}`}>
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform ${darkMode ? 'bg-gray-900' : 'bg-white'} lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <span className={`text-xl font-semibold ${darkMode ? 'text-primary' : 'text-primary'}`}>Mall of Hookah</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 -mr-1 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className={`px-3 mt-6 space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="space-y-2">
            <h3 className={`px-3 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Main</h3>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md ${location.pathname === link.path || (link.path === '/admin' && location.pathname === '/admin/dashboard') ? `${darkMode ? 'bg-gray-800 text-primary' : 'bg-primary/10 text-primary'}` : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}`}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={link.icon} />
                </svg>
                <span className="mx-2">{link.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
      
      {/* Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className={`flex items-center justify-between px-6 py-4 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 mr-3 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {navLinks.find(link => location.pathname === link.path || (link.path === '/admin' && location.pathname === '/admin/dashboard'))?.name || 'Admin'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-primary`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none">
                <div className={`w-8 h-8 rounded-full bg-primary flex items-center justify-center ${darkMode ? 'text-white' : 'text-white'}`}>
                  <span>A</span>
                </div>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Admin</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-dark' : 'bg-gray-100'}`}>
          <div className="container px-6 py-8 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
