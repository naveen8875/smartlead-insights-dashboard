import React, { createContext, useContext, ReactNode } from 'react';
import { useSmartleadData } from '@/hooks/useSmartleadData';

interface SmartleadContextType {
    campaigns: any[];
    emailAccounts: any[];
    clients: any[];
    kpis: any;
    loading: boolean;
    error: string | null;
    lastUpdated: Date;
    refreshData: () => void;
}

const SmartleadContext = createContext<SmartleadContextType | undefined>(undefined);

interface SmartleadProviderProps {
    children: ReactNode;
}

export const SmartleadProvider: React.FC<SmartleadProviderProps> = ({ children }) => {
    const smartleadData = useSmartleadData();

    return (
        <SmartleadContext.Provider value={smartleadData}>
            {children}
        </SmartleadContext.Provider>
    );
};

export const useSmartlead = () => {
    const context = useContext(SmartleadContext);
    if (context === undefined) {
        throw new Error('useSmartlead must be used within a SmartleadProvider');
    }
    return context;
};
