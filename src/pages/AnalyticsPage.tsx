import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Calendar, DollarSign, TrendingUp, Users, Printer, FileText, ChevronUp } from 'lucide-react';

// Types
interface DailyEarning {
  date: string;
  amount: number;
}

interface PrintTypeData {
  name: string;
  value: number;
}

interface PrintSideData {
  name: string;
  value: number;
}

interface JobVolumeData {
  date: string;
  jobs: number;
}

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<DailyEarning[]>([]);
  const [printTypeData, setPrintTypeData] = useState<PrintTypeData[]>([]);
  const [printSideData, setPrintSideData] = useState<PrintSideData[]>([]);
  const [jobVolumeData, setJobVolumeData] = useState<JobVolumeData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalEarnings: 0,
    totalJobs: 0,
    avgJobsPerDay: 0,
    completionRate: 0
  });

  // Colors for charts
  const COLORS = ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4'];
  const PIE_COLORS = ['#4f46e5', '#3b82f6'];

  // Mock data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on selected time range
      let mockEarningsData: DailyEarning[] = [];
      let mockJobVolumeData: JobVolumeData[] = [];
      
      if (timeRange === 'daily') {
        // Last 24 hours data (hourly)
        for (let i = 0; i < 24; i++) {
          const hour = 23 - i;
          const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
          mockEarningsData.push({
            date: hourStr,
            amount: Math.floor(Math.random() * 50) + 10
          });
          mockJobVolumeData.push({
            date: hourStr,
            jobs: Math.floor(Math.random() * 5) + 1
          });
        }
      } else if (timeRange === 'weekly') {
        // Last 7 days data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().getDay();
        
        for (let i = 6; i >= 0; i--) {
          const dayIndex = (today - i + 7) % 7;
          mockEarningsData.push({
            date: days[dayIndex],
            amount: Math.floor(Math.random() * 300) + 100
          });
          mockJobVolumeData.push({
            date: days[dayIndex],
            jobs: Math.floor(Math.random() * 20) + 5
          });
        }
      } else {
        // Monthly data (last 30 days grouped by week)
        for (let i = 4; i >= 0; i--) {
          mockEarningsData.push({
            date: `Week ${5-i}`,
            amount: Math.floor(Math.random() * 1200) + 500
          });
          mockJobVolumeData.push({
            date: `Week ${5-i}`,
            jobs: Math.floor(Math.random() * 80) + 20
          });
        }
      }
      
      // Print type distribution
      const mockPrintTypeData: PrintTypeData[] = [
        { name: 'Black & White', value: 65 },
        { name: 'Color', value: 35 }
      ];
      
      // Print side distribution
      const mockPrintSideData: PrintSideData[] = [
        { name: 'Single-sided', value: 40 },
        { name: 'Double-sided', value: 60 }
      ];
      
      // Total stats
      const mockTotalStats = {
        totalEarnings: 4850,
        totalJobs: 142,
        avgJobsPerDay: 20.3,
        completionRate: 94.5
      };
      
      setEarningsData(mockEarningsData);
      setJobVolumeData(mockJobVolumeData);
      setPrintTypeData(mockPrintTypeData);
      setPrintSideData(mockPrintSideData);
      setTotalStats(mockTotalStats);
      setIsLoading(false);
    };
    
    loadData();
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Business Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your shop's performance and print job trends
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as 'daily' | 'weekly' | 'monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Earnings',
                value: `$${totalStats.totalEarnings}`,
                icon: DollarSign,
                trend: '+12.5%',
                positive: true
              },
              {
                title: 'Total Jobs',
                value: totalStats.totalJobs,
                icon: FileText,
                trend: '+5.2%',
                positive: true
              },
              {
                title: 'Avg. Jobs/Day',
                value: totalStats.avgJobsPerDay,
                icon: Calendar,
                trend: '-2.1%',
                positive: false
              },
              {
                title: 'Completion Rate',
                value: `${totalStats.completionRate}%`,
                icon: TrendingUp,
                trend: '+1.2%',
                positive: true
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-lg">
                      <stat.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                  <div className={`flex items-center ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    <ChevronUp className={`h-4 w-4 ${!stat.positive && 'rotate-180'}`} />
                    <span className="text-sm font-medium ml-0.5">{stat.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
                <div className="text-sm font-medium text-green-600 flex items-center">
                  <ChevronUp className="h-4 w-4 mr-1" />
                  15.3% vs last period
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis tickFormatter={formatCurrency} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#4f46e5"
                      fillOpacity={1}
                      fill="url(#colorEarnings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Job Volume Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Print Job Volume</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={jobVolumeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="jobs"
                      name="Print Jobs"
                      stroke="#4f46e5"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Print Type Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Print Type Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={printTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {printTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Print Side Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Print Side Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={printSideData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {printSideData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;