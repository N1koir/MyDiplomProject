import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Toast from '../ui/Toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toast />
    </div>
  );
};

export default Layout;