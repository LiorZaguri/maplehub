import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 md:ml-64 pt-20 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;