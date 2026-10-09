import React, { useState, useEffect } from 'react';
import { useGrid } from '../context/GridContext';
import { getRiskRanking } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { TrendingUp, Award, ArrowRight } from 'lucide-react';

const RiskRanking = () => {
  const { setActiveTab, setSelectedTransformerId } = useGrid();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await getRiskRanking();
        setRanking(res.data);
      } catch (err) {
        console.error('Error fetching risk ranking:', err);
      }
    };
    fetchRanking();
    const interval = setInterval(fetchRanking, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (id) => {
    setSelectedTransformerId(id);
    setActiveTab('transformer-detail');
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="border-b border-slate-800/80 pb-6">
