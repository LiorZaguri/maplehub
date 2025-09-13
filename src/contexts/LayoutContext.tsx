import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutType = 'sidebar' | 'topbar';

interface LayoutContextType {
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;
  toggleLayout: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const [layoutType, setLayoutTypeState] = useState<LayoutType>(() => {
    // Load from localStorage or default to sidebar
    const saved = localStorage.getItem('maplehub-layout-preference');
    return (saved as LayoutType) || 'sidebar';
  });

  const setLayoutType = (type: LayoutType) => {
    setLayoutTypeState(type);
    localStorage.setItem('maplehub-layout-preference', type);
  };

  const toggleLayout = () => {
    const newType = layoutType === 'sidebar' ? 'topbar' : 'sidebar';
    setLayoutType(newType);
  };

  // Save to localStorage whenever layout changes
  useEffect(() => {
    localStorage.setItem('maplehub-layout-preference', layoutType);
  }, [layoutType]);

  return (
    <LayoutContext.Provider value={{ layoutType, setLayoutType, toggleLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
