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
