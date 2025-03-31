import { useState, useEffect, useRef } from 'react';
import { Printer, FileText, Check, Trash2, QrCode, Clock, AlertCircle, X, Search, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getToken, getShopId } from '../utils/auth';
import { generateShopQRCodePDF } from '../utils/pdfGenerator';
import { io, Socket } from 'socket.io-client';
import { API_ENDPOINTS, BASE_FRONTEND_URL, STATIC_VARIABLES } from '../config'; // Adjust path if needed

// Types
interface PrintJobFile {
  fileName: string;
  filePath: string;
  fileSize: number;
}

interface PrintJob {
  id: string;
  token: string;
  printType: string;
  printSide: string;
  copies: number;
  status: string;
  uploadTime: Date;
  files: PrintJobFile[];
}

// QR Code Modal Component
const QRCodeModal = ({ isOpen, onClose, shop }: { isOpen: boolean; onClose: () => void; shop: any }) => {
  if (!isOpen) return null;

  const handleDownloadQRCode = async () => {
    try {
      await generateShopQRCodePDF(shop);
      toast.success('QR Code PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download QR Code PDF');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Your Shop's QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <QRCode
              value={
                /Android/i.test(navigator.userAgent)
                  ? `intent://${BASE_FRONTEND_URL}/upload?shop_id=${shop._id}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${BASE_FRONTEND_URL}/upload?shop_id=${shop._id};end`
                  : `${BASE_FRONTEND_URL}/upload?shop_id=${shop._id}`
              }
              size={200}
              level="H"
            />
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Display this QR code in your shop for customers to scan and upload their files.
          </p>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Shop ID: {shop._id}</p>
            <p className="text-sm font-medium">{shop.name}</p>
          </div>
          <button
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            onClick={handleDownloadQRCode}
          >
            Download QR Code PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const ShopDashboard = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'expired'>(
    STATIC_VARIABLES.STATUS_TYPES.PENDING
  );
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcceptingUploads, setIsAcceptingUploads] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io(STATIC_VARIABLES.SOCKET_URL, {
      auth: { token: getToken() },
      transports: [...STATIC_VARIABLES.SOCKET_TRANSPORTS],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinShopRoom', getShopId());
    });

    socket.on('newBatchPrintJob', (newJob: any) => {
      // Ensure the job has the correct structure
      const formattedJob: PrintJob = {
        id: newJob.id || newJob._id,
        token: newJob.token || newJob.token_number,
        printType: newJob.printType || newJob.print_type,
        printSide: newJob.printSide || newJob.print_side,
        copies: newJob.copies || 1,
        status: newJob.status || 'pending',
        uploadTime: newJob.uploadTime ? new Date(newJob.uploadTime) : new Date(),
        files: Array.isArray(newJob.files) ? newJob.files.map((file: any) => ({
          fileName: file.fileName,
          filePath: file.filePath || file.file_path,
          fileSize: file.fileSize || 0
        })) : []
      };
      
      setPrintJobs(prevJobs => {
        if (prevJobs.some(job => job.id === formattedJob.id)) return prevJobs;
        return [formattedJob, ...prevJobs];
      });
      
      toast.success(`New print job received with ${formattedJob.files.length} files!`);
    });

    socket.on('jobStatusUpdate', (update: { id: string, status: string }) => {
      setPrintJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === update.id ? { ...job, status: update.status } : job
        )
      );
      
      // Show a single toast notification
      if (update.status === 'completed') {
        toast.success(`Job marked as completed`);
      } else if (update.status === 'deleted') {
        toast.success(`Job deleted successfully`);
      } else {
        toast.info(`Job status updated to ${update.status}`);
      }
    });

    socket.on('batchStatusUpdate', (update: { token: string, status: string }) => {
      setPrintJobs(prevJobs => 
        prevJobs.map(job => 
          job.token === update.token ? { ...job, status: update.status } : job
        )
      );
      
      // Show a single toast notification
      if (update.status === 'completed') {
        toast.success(`Jobs marked as completed`);
      } else if (update.status === 'deleted') {
        toast.success(`Jobs deleted successfully`);
      } else {
        toast.info(`Jobs status updated to ${update.status}`);
      }
    });

    socket.on('disconnect', () => {
      // Handle disconnect
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Fetch shop details
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.SHOP_DETAILS}/${getShopId()}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch shop details');
        }
        const shop = await response.json();
        setShop(shop);
        setIsAcceptingUploads(shop.isAcceptingUploads);
      } catch (error) {
        toast.error('Failed to fetch shop details');
      }
    };

    fetchShopDetails();
  }, []);

  // Fetch initial print jobs for today
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.PRINT_JOBS}/prints/${getShopId()}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch print jobs');
        }
        
        const data = await response.json();
        
        // Transform the data to match our PrintJob interface
        const formattedJobs: PrintJob[] = data.map((job: any) => ({
          id: job._id,
          token: job.token_number,
          printType: job.print_type,
          printSide: job.print_side,
          copies: job.copies,
          status: job.status,
          uploadTime: new Date(job.uploaded_at),
          files: Array.isArray(job.files) ? job.files.map((file: any) => ({
            fileName: file.fileName,
            filePath: file.filePath || file.file_path,
            fileSize: file.fileSize
          })) : [{
            // For backward compatibility with old data structure
            fileName: job.fileName,
            filePath: job.file_path,
            fileSize: job.fileSize
          }]
        }));
        
        setPrintJobs(formattedJobs);
      } catch (error) {
        toast.error('Failed to fetch print jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleMarkAsCompleted = async (jobId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PRINT_JOBS}/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }
      
      toast.success('Job marked as completed');
    } catch (error) {
      console.error('Error marking job as completed:', error);
      toast.error('Failed to mark job as completed');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_ENDPOINTS.PRINT_JOBS}/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleToggleUploads = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SHOP_DETAILS}/${getShopId()}/toggle-uploads`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAcceptingUploads: !isAcceptingUploads }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shop status');
      }

      setIsAcceptingUploads(!isAcceptingUploads);
      toast.success(`Upload form ${!isAcceptingUploads ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update shop status');
    }
  };

  const filteredJobs = printJobs.filter(job => job.status === activeTab);

  const filteredAndSearchedJobs = filteredJobs.filter(job =>
    job.token.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUploadTimeDisplay = (date: Date | string | undefined): string => {
    if (!date) return 'Unknown time';
    
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    try {
      // Format the date
      return format(dateObj, 'h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileText className="h-8 w-8 text-gray-400" />;
    
    // Return appropriate icon based on file type
    return <FileText className="h-8 w-8 text-indigo-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Expired
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Trash2 className="mr-1 h-3 w-3" />
            Deleted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    if (!filePath) {
      toast.error('File is not available for download');
      return;
    }
    
    try {
      const response = await fetch(`${API_ENDPOINTS.FILE_DOWNLOAD}?path=${encodeURIComponent(filePath)}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Only show toast for individual file downloads
      if (fileName) {
        toast.success(`Downloaded: ${fileName}`);
      }
    } catch (error: any) {
      toast.error(`Download failed: ${error.message}`);
    }
  };

  const formatFileName = (filePath: string | null) => {
    if (!filePath) return 'File Deleted';
    const fileName = filePath.split(/[/\\]/).pop() || '';
    return fileName.replace(/^\d+-/, '');
  };

  const handleDownloadFiles = async (jobId: string) => {
    const toastId = toast.loading('Preparing download...');
    
    try {
      const job = printJobs.find(job => job.id === jobId);
      if (!job) {
        toast.error('Job not found', { id: toastId });
        return;
      }

      // For direct download with authentication
      const token = getToken();
      const response = await fetch(`${API_ENDPOINTS.PRINT_JOB_BATCH_DOWNLOAD}/${job.token}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download files');
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `printjob-${job.token}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download complete', { id: toastId });
    } catch (error: any) {
      console.error('Error downloading files:', error);
      toast.error(`Download failed: ${error.message}`, { id: toastId });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg mr-3">
                    <Printer className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Print Jobs Dashboard</h1>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your print jobs and track customer requests (Today Only)
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <div className="relative">
                  <button
                    onClick={handleToggleUploads}
                    className={`
                      flex items-center space-x-3 px-6 py-3 rounded-lg shadow-lg 
                      transition-all duration-300 transform hover:scale-105
                      ${isAcceptingUploads 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                      } text-white font-medium
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-3 h-3 rounded-full shadow-inner animate-pulse
                        ${isAcceptingUploads ? 'bg-green-300' : 'bg-red-300'}
                      `} />
                      <span className="text-sm font-semibold">
                        {isAcceptingUploads ? 'File Uploads: Enabled' : 'File Uploads: Disabled'}
                      </span>
                    </div>
                    <div className={`
                      w-12 h-6 rounded-full p-1 transition-colors duration-300
                      ${isAcceptingUploads ? 'bg-green-400' : 'bg-red-400'}
                    `}>
                      <div className={`
                        bg-white w-4 h-4 rounded-full shadow-md 
                        transition-transform duration-300 ease-in-out
                        ${isAcceptingUploads ? 'translate-x-6' : 'translate-x-0'}
                      `} />
                    </div>
                  </button>
                  <div className={`
                    absolute -bottom-8 left-0 right-0 text-center text-xs
                    ${isAcceptingUploads ? 'text-green-600' : 'text-red-600'}
                    font-medium transition-colors duration-300
                  `}>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowQRModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Show Shop QR Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Jobs (Today)</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {printJobs.filter(job => job.status === STATIC_VARIABLES.STATUS_TYPES.PENDING).length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed Jobs (Today)</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {printJobs.filter(job => job.status === STATIC_VARIABLES.STATUS_TYPES.COMPLETED).length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Expired Jobs (Today)</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {printJobs.filter(job => job.status === STATIC_VARIABLES.STATUS_TYPES.EXPIRED).length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by token number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['pending', 'completed', 'expired'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'pending' | 'completed' | 'expired')}
                    className={`${activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === tab ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {printJobs.filter(job => job.status === tab).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredAndSearchedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-900">
                    {searchQuery ? "No jobs found with that token number" : `No ${activeTab} print jobs for today`}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery
                      ? "Try searching with a different token number"
                      : activeTab === STATIC_VARIABLES.STATUS_TYPES.PENDING
                        ? "You don't have any pending print jobs today."
                        : activeTab === STATIC_VARIABLES.STATUS_TYPES.COMPLETED
                          ? "You haven't completed any print jobs today."
                          : "You don't have any expired print jobs today."}
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200 space-y-2">
                    {filteredAndSearchedJobs.map((job) => (
                      <li key={job.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                        <div className="px-6 py-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center max-w-2xl">
                              <div className="flex-shrink-0">{getFileIcon(job.printType)}</div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {job.files.map(file => file.fileName).join(', ')}
                                  </h4>
                                  <span className="ml-2 flex-shrink-0">{getStatusBadge(job.status)}</span>
                                </div>
                                <div className="mt-2 flex items-center space-x-2">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                      job.printType === 'bw' ? 'bg-gray-100 text-gray-800' : 'bg-blue-50 text-blue-700'
                                    }`}
                                  >
                                    {job.printType === 'bw' ? 'Black & White' : 'Color'}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                                    {job.printSide === 'single' ? 'Single-sided' : 'Double-sided'}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                                    {job.copies} {job.copies === 1 ? 'copy' : 'copies'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Token: <span className="text-indigo-600 font-bold">{job.token}</span>
                              </div>
                              <div className="text-xs text-gray-500">{getUploadTimeDisplay(job.uploadTime)}</div>
                            </div>
                          </div>
                          {job.status === STATIC_VARIABLES.STATUS_TYPES.PENDING && (
                            <div className="mt-4 flex justify-end space-x-3">
                              <button
                                onClick={() => handleMarkAsCompleted(job.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Mark as Completed
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </button>
                              <button
                                onClick={() => handleDownloadFiles(job.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Download All
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shop={shop}
      />
    </>
  );
};

export default ShopDashboard;