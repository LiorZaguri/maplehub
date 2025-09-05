import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-3 sm:p-4 sm:pt-24 md:p-6 md:pt-24 lg:p-8 lg:pt-24 xl:ml-64 xl:pt-6 pt-24">
        {children}
      </main>
    </div>
  );
};

export default Layout;
