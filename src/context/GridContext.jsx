import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getGridSummary, getGridHierarchy, getAlerts } from '../services/api';

const GridContext = createContext(null);

export const GridProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedTransformerId, setSelectedTransformerId] = useState('trans-005'); // Default to T-S-001 (Critical demo transformer)
  const [loading, setLoading] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = useCallback(async () => {
    try {
      const [summaryRes, gridRes, alertsRes] = await Promise.all([
        getGridSummary(),
        getGridHierarchy(),
        getAlerts()
      ]);
      setSummary(summaryRes.data);
      setGridData(gridRes.data);
      setAlerts(alertsRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('GridData refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll telemetry every 3 seconds (<3s latency requirement)
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <GridContext.Provider
      value={{
        activeTab,
        setActiveTab,
        summary,
        gridData,
        alerts,
        selectedTransformerId,
        setSelectedTransformerId,
        loading,
        isLiveConnected,
        lastUpdated,
        refreshData
      }}
    >
      {children}
    </GridContext.Provider>
  );
};

export const useGrid = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGrid must be used within GridProvider');
  }
  return context;
};
