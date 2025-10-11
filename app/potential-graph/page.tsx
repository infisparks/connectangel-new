"use client";

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, Loader2, Filter, X, TrendingUp, TrendingDown, BarChart3, Layers } from 'lucide-react';
// Revert to named imports, which is the standard way. 
// The original errors are typically environmental/config issues.
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';

// Button Component
const Button = ({ onClick, children, className = '', variant = 'primary' }: any) => {
  const variants = {
    primary: 'bg-gradient-to-r  from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700/50',
    ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/20'
  };
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5  rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {children}
    </button>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end  sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20 animate-slide-up">
        {children}
      </div>
    </div>
  );
};

// Data Types
interface DomainDataRaw {
  domain: string;
  total_potential: number;
  current_potential: number;
}

interface DistrictDataRaw {
  potentialData: DomainDataRaw[];
}

interface RawStateData {
  [districtKey: string]: DistrictDataRaw;
}

interface RawCountryData {
  [stateKey: string]: RawStateData;
}

interface DomainData extends DomainDataRaw {
  required_potential: number;
}

interface HierarchyNode {
  name: string;
  key: string;
  level: 'country' | 'state' | 'district';
  parentKey: string | null;
  total_potential: number;
  current_potential: number;
  required_potential: number;
  children: { [key: string]: HierarchyNode };
  domains: DomainData[];
}

interface ChartDataPoint {
  name: string;
  total_potential: number;
  current_potential: number;
  required_potential: number;
  isDrillable: boolean;
}

// Data Processing Functions
function calculateDomainRequired(domain: DomainDataRaw): DomainData {
  return {
    ...domain,
    required_potential: domain.total_potential - domain.current_potential,
  };
}

function calculateNodeTotals(domains: DomainData[]): {
  total_potential: number;
  current_potential: number;
  required_potential: number;
} {
  return domains.reduce(
    (acc, domain) => {
      acc.total_potential += domain.total_potential;
      acc.current_potential += domain.current_potential;
      acc.required_potential += domain.required_potential;
      return acc;
    },
    { total_potential: 0, current_potential: 0, required_potential: 0 }
  );
}

function processRawData(rawData: { india: RawCountryData }): HierarchyNode {
  const rootKey = 'India';
  const hierarchy: HierarchyNode = {
    name: rootKey,
    key: rootKey,
    level: 'country',
    parentKey: null,
    children: {},
    total_potential: 0,
    current_potential: 0,
    required_potential: 0,
    domains: [],
  };

  const indiaDomainAggregation: { [domain: string]: { total: number, current: number } } = {};

  for (const stateKeyRaw in rawData.india) {
    const stateName = stateKeyRaw.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const rawDistricts = rawData.india[stateKeyRaw];
    const stateDomainAggregation: { [domain: string]: { total: number, current: number } } = {};
    const stateChildren: { [key: string]: HierarchyNode } = {};

    for (const districtKeyRaw in rawDistricts) {
      const districtName = districtKeyRaw.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      
      const districtDomains = rawDistricts[districtKeyRaw].potentialData.map(calculateDomainRequired);
      const districtTotals = calculateNodeTotals(districtDomains);

      const districtNode: HierarchyNode = {
        name: districtName,
        key: `${stateKeyRaw}_${districtKeyRaw}`,
        level: 'district',
        parentKey: stateKeyRaw,
        children: {},
        domains: districtDomains,
        ...districtTotals,
      };
      stateChildren[districtName] = districtNode;

      districtDomains.forEach(d => {
        if (!stateDomainAggregation[d.domain]) {
          stateDomainAggregation[d.domain] = { total: 0, current: 0 };
        }
        stateDomainAggregation[d.domain].total += d.total_potential;
        stateDomainAggregation[d.domain].current += d.current_potential;
      });
    }

    const stateDomains: DomainData[] = Object.entries(stateDomainAggregation).map(([domain, data]) => ({
      domain: domain,
      total_potential: data.total,
      current_potential: data.current,
      required_potential: data.total - data.current,
    }));
    const stateTotals = calculateNodeTotals(stateDomains);

    const stateNode: HierarchyNode = {
      name: stateName,
      key: stateKeyRaw,
      level: 'state',
      parentKey: rootKey,
      children: stateChildren,
      domains: stateDomains,
      ...stateTotals,
    };
    hierarchy.children[stateName] = stateNode;

    stateDomains.forEach(d => {
        if (!indiaDomainAggregation[d.domain]) {
            indiaDomainAggregation[d.domain] = { total: 0, current: 0 };
        }
        indiaDomainAggregation[d.domain].total += d.total_potential;
        indiaDomainAggregation[d.domain].current += d.current_potential;
    });
  }
  
  const indiaDomains: DomainData[] = Object.entries(indiaDomainAggregation).map(([domain, data]) => ({
      domain: domain,
      total_potential: data.total,
      current_potential: data.current,
      required_potential: data.total - data.current,
  }));
  const indiaTotals = calculateNodeTotals(indiaDomains);
  
  hierarchy.domains = indiaDomains;
  hierarchy.total_potential = indiaTotals.total_potential;
  hierarchy.current_potential = indiaTotals.current_potential;
  hierarchy.required_potential = indiaTotals.required_potential;
  
  return hierarchy;
}

// Main Component
const PotentialGraphClient = () => {
  const [rootNode, setRootNode] = useState<HierarchyNode | null>(null);
  const [currentNode, setCurrentNode] = useState<HierarchyNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState<HierarchyNode[]>([]);
  
  const [viewMode, setViewMode] = useState<'geographic' | 'domain'>('geographic');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const allStateNames = useMemo(() => {
    if (!rootNode) return [];
    return Object.values(rootNode.children).map(node => node.name).sort();
  }, [rootNode]);

  const districtNamesInSelectedState = useMemo(() => {
    if (!rootNode || !selectedState) return [];
    const stateNode = Object.values(rootNode.children).find(n => n.name === selectedState);
    if (stateNode && Object.keys(stateNode.children).length > 0) {
        return Object.values(stateNode.children).map(node => node.name).sort();
    }
    return [];
  }, [rootNode, selectedState]);

  const domainViewNode = useMemo(() => {
    if (!rootNode) return null;
    if (!selectedState) return rootNode;
    const stateNode = Object.values(rootNode.children).find(n => n.name === selectedState);
    if (!stateNode) return rootNode;
    if (selectedDistrict) {
        const districtNode = Object.values(stateNode.children).find(n => n.name === selectedDistrict);
        return districtNode || stateNode;
    }
    return stateNode;
  }, [rootNode, selectedState, selectedDistrict]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const FILE_PATHS = [
          '/statedata/8 State X 173 District by Rahima.json',
        //   '/statedata/data-json file.json',
          '/statedata/MH_AS_TN_BR_WB_data.json',
          '/statedata/RJ_MP_UP_StateData.json',
          '/statedata/Odisha, Karnataka , Gujarat, Chhattisgarh , Telangana_by saniya.json',
        ];

        const fetchPromises = FILE_PATHS.map(path => 
            fetch(path).then(res => {
                if (!res.ok) throw new Error(`Failed to fetch data from ${path}`);
                return res.json();
            })
        );

        const results = await Promise.all(fetchPromises);
        const mergedRawData: { india: RawCountryData } = { india: {} };
        results.forEach(data => {
            if (data.india) {
                Object.assign(mergedRawData.india, data.india);
            }
        });
        
        const processedRoot = processRawData(mergedRawData);
        setRootNode(processedRoot);
        setCurrentNode(processedRoot);
        setPath([processedRoot]);
      } catch (e) {
        console.error("Error processing data:", e);
        setError(`Error loading data: ${(e as Error).message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDrillDown = (name: string) => {
    if (viewMode !== 'geographic') return;
    if (!currentNode || !currentNode.children || !currentNode.children[name]) return;
    const nextNode = currentNode.children[name];
    setCurrentNode(nextNode);
    setPath(prev => [...prev, nextNode]);
  };
  
  const handleViewModeChange = (mode: 'geographic' | 'domain') => {
    setViewMode(mode);
    setSelectedState('');
    setSelectedDistrict('');
    if (rootNode) {
        setCurrentNode(rootNode);
        setPath([rootNode]);
    }
  };

  const handleGoBack = () => {
    if (viewMode !== 'geographic') return;
    if (path.length > 1) {
      const newPath = path.slice(0, -1);
      const previousNode = newPath[newPath.length - 1]; 
      if (previousNode) {
        setCurrentNode(previousNode);
        setPath(newPath);
      }
    }
  };

  const applyFilters = () => {
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
  };
  
  const chartDisplayData = useMemo<ChartDataPoint[]>(() => {
    let activeNode: HierarchyNode | null = null;
    
    if (viewMode === 'geographic') {
        activeNode = currentNode;
    } else {
        activeNode = domainViewNode;
    }

    if (!activeNode) return [];
    const currentLevel = activeNode.level;
    
    if (viewMode === 'geographic' && (currentLevel === 'country' || currentLevel === 'state')) {
      return Object.values(activeNode.children).map(child => ({
        name: child.name,
        total_potential: child.total_potential,
        current_potential: child.current_potential,
        required_potential: child.required_potential,
        isDrillable: Object.keys(child.children).length > 0, 
      })).sort((a, b) => b.total_potential - a.total_potential);
    } else {
      return activeNode.domains.map(domain => ({
        name: domain.domain,
        total_potential: domain.total_potential,
        current_potential: domain.current_potential,
        required_potential: domain.required_potential,
        isDrillable: false, 
      })).sort((a, b) => b.total_potential - a.total_potential);
    }
  }, [currentNode, domainViewNode, viewMode]);
  
  const chartTitle = useMemo(() => {
    const activeNode = viewMode === 'geographic' ? currentNode : domainViewNode;
    if (!activeNode) return "Potential Capacity Analysis";
    const { name, level } = activeNode;
    
    if (viewMode === 'domain') {
        const domainLevel = selectedDistrict ? 'District' : selectedState ? 'State' : 'Country';
        return `${name} - Domain Analysis`;
    }
    
    switch (level) {
      case 'country':
        return `${name} - State Overview`;
      case 'state':
        return `${name} - District Overview`;
      case 'district':
        return `${name} - Domain Breakdown`;
      default:
        return 'Capacity Analysis';
    }
  }, [currentNode, domainViewNode, viewMode, selectedState, selectedDistrict]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
          <p className="text-lg text-gray-300 animate-pulse">Loading Dashboard...</p>
        </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6 max-w-md">
          <p className="text-lg text-red-400 font-medium">⚠️ {error}</p>
        </div>
    </div>
  );
  
  const activeNode = viewMode === 'geographic' ? currentNode : domainViewNode;
  const hasActiveFilters = selectedState || selectedDistrict;
  const utilizationRate = activeNode ? (activeNode.current_potential / activeNode.total_potential * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 mt-24 via-purple-900/20 to-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-purple-500/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                  Capacity Dashboard
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">Real-time capacity analytics</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => handleViewModeChange('geographic')}
                variant={viewMode === 'geographic' ? 'primary' : 'secondary'}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Layers className="w-4 h-4 mr-1.5 inline" />
                Geographic
              </Button>
              <Button 
                onClick={() => handleViewModeChange('domain')}
                variant={viewMode === 'domain' ? 'primary' : 'secondary'}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <BarChart3 className="w-4 h-4 mr-1.5 inline" />
                Domain
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Filter Card */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-800/40 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Current View</p>
                <p className="text-lg font-semibold text-white truncate">
                  {activeNode?.name}
                  <span className="text-xs text-purple-400 ml-2 font-normal">
                    ({activeNode?.level.charAt(0).toUpperCase()}{activeNode?.level.slice(1)})
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              {viewMode === 'geographic' && path.length > 1 && (
                <Button 
                  onClick={handleGoBack} 
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
              
              {viewMode === 'domain' && (
                <Button 
                  onClick={() => setIsFilterModalOpen(true)}
                  variant="secondary"
                  className="relative"
                >
                  <Filter className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-gray-800 animate-pulse" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {viewMode === 'domain' && hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex flex-wrap gap-2">
                {selectedState && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-xs text-purple-300">
                    State: {selectedState}
                  </span>
                )}
                {selectedDistrict && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/20 border border-pink-500/50 rounded-full text-xs text-pink-300">
                    District: {selectedDistrict}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {activeNode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Potential</p>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                {(activeNode.total_potential / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">{activeNode.total_potential.toLocaleString('en-IN')} units</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-2xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Current Capacity</p>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">
                {(activeNode.current_potential / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">{activeNode.current_potential.toLocaleString('en-IN')} units</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm rounded-2xl p-4 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Required Capacity</p>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-400">
                {(activeNode.required_potential / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">{activeNode.required_potential.toLocaleString('en-IN')} units</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/5 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Utilization</p>
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">
                {utilizationRate.toFixed(1)}%
              </p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chart Section */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-800/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-200 truncate">{chartTitle}</h2>
            <span className="text-xs text-gray-500 bg-gray-700/50 px-3 py-1 rounded-full">
              {chartDisplayData.length} items
            </span>
          </div>
          
          <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height="100%">
              {/* @ts-ignore */}
              <BarChart
                data={chartDisplayData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                layout="vertical"
              >
                {/* @ts-ignore */}
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                {/* @ts-ignore */}
                <XAxis 
                  type="number" 
                  stroke="#9CA3AF" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}K`}
                />
                {/* @ts-ignore */}
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  width={viewMode === 'domain' ? 100 : 80}
                  tickFormatter={(value: string) => 
                    value.length > 12 ? `${value.substring(0, 10)}...` : value
                  }
                />
                {/* @ts-ignore */}
                <Tooltip 
                  formatter={(value: any) => [`${(value as number).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #6B21A8', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                {/* @ts-ignore */}
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                
                {/* @ts-ignore */}
                <Bar 
                  dataKey="required_potential" 
                  fill="#EF4444" 
                  name="Required" 
                  stackId="a" 
                  radius={[0, 0, 0, 0]}
                  className={viewMode === 'geographic' ? 'cursor-pointer' : ''}
                  onClick={(data: any) => data && viewMode === 'geographic' && data.isDrillable && handleDrillDown(data.name)}
                >
                  {chartDisplayData.map((entry, index) => (
                    // @ts-ignore
                    <Cell
                      key={`cell-required-${index}`}
                      fillOpacity={viewMode === 'geographic' && entry.isDrillable ? 1 : 0.8}
                    />
                  )) as any}
                </Bar>
                
                {/* @ts-ignore */}
                <Bar 
                  dataKey="current_potential" 
                  fill="#10B981" 
                  name="Current" 
                  stackId="a"
                  radius={[0, 4, 4, 0]}
                  className={viewMode === 'geographic' ? 'cursor-pointer' : ''}
                  onClick={(data: any) => data && viewMode === 'geographic' && data.isDrillable && handleDrillDown(data.name)}
                >
                  {chartDisplayData.map((entry, index) => (
                    // @ts-ignore
                    <Cell key={`cell-current-${index}`} fillOpacity={viewMode === 'geographic' && entry.isDrillable ? 1 : 0.8} />
                  )) as any}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {viewMode === 'geographic' && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Click on bars to drill down into regions
            </p>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Filter Options</h3>
              <p className="text-xs text-purple-100 mt-0.5">Customize your view</p>
            </div>
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(false)}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] sm:max-h-[calc(90vh-140px)]">
          {/* State Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Select State
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
              <button
                onClick={() => {
                  setSelectedState('');
                  setSelectedDistrict('');
                }}
                className={`p-4 rounded-xl text-left transition-all duration-200 ${
                  !selectedState 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50'
                }`}
              >
                <div className="font-medium">All India</div>
                <div className="text-xs opacity-75 mt-1">View nationwide data</div>
              </button>
              
              {allStateNames.map(stateName => (
                <button
                  key={stateName}
                  onClick={() => {
                    setSelectedState(stateName);
                    setSelectedDistrict('');
                  }}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    selectedState === stateName 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50'
                  }`}
                >
                  <div className="font-medium">{stateName}</div>
                  <div className="text-xs opacity-75 mt-1">State level data</div>
                </button>
              ))}
            </div>
          </div>

          {/* District Selection */}
          {selectedState && districtNamesInSelectedState.length > 0 && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-400" />
                Select District in {selectedState}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-800">
                <button
                  onClick={() => setSelectedDistrict('')}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    !selectedDistrict 
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30' 
                      : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50'
                  }`}
                >
                  <div className="font-medium">All Districts</div>
                  <div className="text-xs opacity-75 mt-1">View state-wide data</div>
                </button>
                
                {districtNamesInSelectedState.map(districtName => (
                  <button
                    key={districtName}
                    onClick={() => setSelectedDistrict(districtName)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedDistrict === districtName 
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50'
                    }`}
                  >
                    <div className="font-medium">{districtName}</div>
                    <div className="text-xs opacity-75 mt-1">District level data</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Selection Summary */}
          {hasActiveFilters && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-purple-300 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedState && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/30 rounded-lg text-sm">
                    <MapPin className="w-3 h-3" />
                    {selectedState}
                  </span>
                )}
                {selectedDistrict && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/30 rounded-lg text-sm">
                    <Layers className="w-3 h-3" />
                    {selectedDistrict}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-purple-500/20 p-4 flex gap-3">
          <Button 
            onClick={clearFilters}
            variant="secondary"
            className="flex-1"
          >
            Clear All
          </Button>
          <Button 
            onClick={applyFilters}
            variant="primary"
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </Modal>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }

        .scrollbar-thumb-purple-500::-webkit-scrollbar-thumb {
          background: #a855f7;
          border-radius: 10px;
        }

        .scrollbar-thumb-pink-500::-webkit-scrollbar-thumb {
          background: #ec4899;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9333ea;
        }

        @media (max-width: 640px) {
          .animate-slide-up {
            animation: slide-up 0.2s ease-out;
          }
        }
      `}</style>
    </div>
  );
};

export default PotentialGraphClient;