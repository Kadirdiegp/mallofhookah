import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`flex flex-col min-h-screen w-full ${darkMode ? 'bg-dark text-light' : 'bg-white text-gray-900'}`}>
      <Header />
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
