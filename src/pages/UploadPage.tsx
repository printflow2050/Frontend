import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSearchParams, Link } from 'react-router-dom';
import { Upload, FileText, Check, Printer, Clock, AlertCircle, Store, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { CSSTransition } from 'react-transition-group';
import './styles/UploadPage.css';
import { API_ENDPOINTS, STATIC_VARIABLES } from '../config';

type PrintType = 'bw' | 'color';
type PrintSide = 'single' | 'double';

const UploadPage = () => {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id');
  const [shopName, setShopName] = useState('');
  const [bwCostPerPage, setBwCostPerPage] = useState(0);
  const [colorCostPerPage, setColorCostPerPage] = useState(0);
  const [isShopClosed, setIsShopClosed] = useState(true);

  const [files, setFiles] = useState<File[]>([]);
  const [printType, setPrintType] = useState<PrintType>('bw');
  const [printSide, setPrintSide] = useState<PrintSide>('single');
  const [copies, setCopies] = useState<number>(STATIC_VARIABLES.MIN_COPIES);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [token, setToken] = useState<string>('');
  const [jobStatus, setJobStatus] = useState<'pending' | 'completed' | 'expired' | 'deleted'>(
    STATIC_VARIABLES.STATUS_TYPES.PENDING
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const nodeRef = useRef(null);

  // Fetch shop details
  useEffect(() => {
    const fetchShopDetails = async () => {
      if (shopId) {
        try {
          const response = await fetch(`${API_ENDPOINTS.SHOP_DETAILS}/${shopId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch shop details');
          }
          const shop = await response.json();
          setShopName(shop.name);
          setBwCostPerPage(shop.bw_cost_per_page);
          setColorCostPerPage(shop.color_cost_per_page);
          setIsShopClosed(!shop.isAcceptingUploads); // Set shop status
        } catch (error) {
          toast.error('Failed to fetch shop details');
        }
      }
    };

    fetchShopDetails();
  }, [shopId]);

  // Check for existing token and fetch its status on page load
  useEffect(() => {
    const checkPreviousUpload = async () => {
      const storedToken = localStorage.getItem(`uploadToken_${shopId}`);
      if (storedToken && shopId) {
        try {
          const response = await fetch(`${API_ENDPOINTS.PRINT_JOB_STATUS}/${storedToken}`);
          if (!response.ok) {
            throw new Error('Failed to fetch job status');
          }
          const job = await response.json();
          setToken(storedToken);
          setJobStatus(job.status);
          setUploadComplete(true);
          setFiles([{ name: job.fileName } as File]);
          setPrintType(job.print_type);
          setPrintSide(job.print_side);
          setCopies(job.copies);
        } catch (error) {
          localStorage.removeItem(`uploadToken_${shopId}`);
        }
      }
    };

    checkPreviousUpload();
  }, [shopId]);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io(STATIC_VARIABLES.SOCKET_URL, {
      transports: [...STATIC_VARIABLES.SOCKET_TRANSPORTS],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Join shop-specific room when connected
      if (shopId) {
        socket.emit('joinShopRoom', shopId);
      }
    });

    // Listen for shop status updates
    socket.on('shopStatusUpdate', (data: { isAcceptingUploads: boolean }) => {
      setIsShopClosed(!data.isAcceptingUploads);
    });

    // Listen for updates specific to THIS token
    socket.on('jobStatusUpdate', (updatedJob: { id: string; token: string; status: string }) => {
      // Check if the update is for the token currently displayed on this page
      if (updatedJob.token === token) {
        setJobStatus(updatedJob.status);
        // Optional: Show a toast notification
        if (updatedJob.status === 'completed') {
          toast.success(`Job #${token} is completed!`);
        } else if (updatedJob.status === 'deleted') {
          toast.error(`Job #${token} was declined/deleted.`);
        }
      }
    });

    // Listen for BATCH updates as well, in case the shop owner acts on the whole batch
    socket.on('batchStatusUpdate', (update: { token: string; status: string; count: number }) => {
      if (update.token === token) {
        setJobStatus(update.status);
        if (update.status === 'completed') {
          toast.success(`All jobs for #${token} completed!`);
        } else if (update.status === 'deleted') {
          toast.error(`All jobs for #${token} were declined/deleted.`);
        }
      }
    });

    socket.on('connect_error', (error) => {
      toast.error('WebSocket connection error');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, shopId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: STATIC_VARIABLES.ACCEPTED_FILE_TYPES,
    multiple: true,
    maxSize: STATIC_VARIABLES.MAX_FILE_SIZE_MB * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('print_type', printType);
      formData.append('print_side', printSide);
      formData.append('copies', copies.toString());

      const uploadEndpoint = `${API_ENDPOINTS.UPLOAD_FILE}/${shopId}`;

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      const newToken = data.token_number;
      setToken(newToken);
      localStorage.setItem(`uploadToken_${shopId}`, newToken);
      setUploadComplete(true);
      setJobStatus(STATIC_VARIABLES.STATUS_TYPES.PENDING);
      toast.success(`${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded successfully!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!shopId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid QR Code</h2>
          <p className="text-gray-600 mb-6">
            This upload page requires a valid shop ID. Please scan a valid QR code from a registered Xerox shop.
          </p>
        </div>
      </div>
    );
  }

  if (isShopClosed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className="bg-red-50 p-6 text-center border-b border-red-100">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Currently Closed</h2>
            <div className="flex items-center justify-center text-red-600 text-sm font-medium">
              <AlertCircle className="h-4 w-4 mr-2" />
              Not Accepting File Uploads
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{shopName || 'Print Shop'}</h3>
              <p className="text-sm text-gray-600">
                This shop is currently not accepting file uploads. Please wait until the shop enables uploads.
              </p>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <CSSTransition
        in={uploadComplete && !isTransitioning}
        timeout={STATIC_VARIABLES.FADE_ANIMATION_TIMEOUT}
        classNames="fade"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white shadow-xl sm:rounded-xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Upload Successful!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your files have been uploaded successfully to{' '}
                <span className="font-medium text-indigo-600">{shopName}</span>
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Your Token Number</h3>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 text-center mb-2">
                  {token}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Show this token to the shop owner to collect your prints
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Files Uploaded:</span>
                  <span className="font-medium text-gray-900">{files.length}</span>
                </div>

                {files.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Filenames:</h4>
                    <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                      {files.map((file, index) => (
                        <li key={index} className="text-xs text-gray-700 truncate" title={file.name}>
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Print Type:</span>
                  <span className="font-medium text-gray-900">{printType === 'bw' ? 'B&W' : 'Color'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Print Side:</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                    {printSide === 'single' ? 'Single-sided' : 'Double-sided'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Copies:</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                    {copies} {copies === 1 ? 'copy' : 'copies'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      jobStatus === STATIC_VARIABLES.STATUS_TYPES.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      jobStatus === STATIC_VARIABLES.STATUS_TYPES.COMPLETED ? 'bg-green-100 text-green-800' :
                      jobStatus === 'deleted' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800' // Expired or other
                    }`}>
                    {jobStatus === STATIC_VARIABLES.STATUS_TYPES.PENDING ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </>
                    ) : jobStatus === STATIC_VARIABLES.STATUS_TYPES.COMPLETED ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </>
                    ) : jobStatus === 'deleted' ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Declined
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expired
                      </>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (jobStatus === STATIC_VARIABLES.STATUS_TYPES.COMPLETED || jobStatus === 'deleted') {
                    // First set a transitioning state to trigger animation
                    const transitionOut = () => {
                      // After animation completes, reset all state variables
                      setFiles([]);
                      setPrintType('bw');
                      setPrintSide('single');
                      setCopies(STATIC_VARIABLES.MIN_COPIES);
                      setIsUploading(false);
                      setUploadComplete(false);
                      setToken('');
                      localStorage.removeItem(`uploadToken_${shopId}`);
                    };
                    
                    // Start the transition
                    setUploadComplete(false);
                    
                    // Use setTimeout to ensure the transition has time to complete
                    setTimeout(transitionOut, 300);
                  } else {
                    // Show toast for pending jobs
                    toast.info(
                      <div className="flex items-center space-x-2">
                        <span>Your job </span>
                        <span className="font-bold text-yellow-500">#{token}</span>
                        <span>is still pending</span>
                      </div>,
                      {
                        duration: 3000,
                        icon: '⏳',
                      }
                    );
                  }
                }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Upload Another File
              </button>
            </div>
            <Footer />
          </div>
        </div>
      </CSSTransition>

      {!uploadComplete && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg">
              <Printer className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              PrintFlow
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Upload Files for Printing
          </h2>
          {shopName && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Uploading to: <span className="font-medium text-indigo-600">{shopName}</span>
            </p>
          )}

          <div className="mt-8">
            <div className="bg-white shadow-xl sm:rounded-xl border border-gray-100 overflow-hidden">
              <div className="py-8 px-4 sm:px-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                        isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">
                          Drag & drop files here, or click to select
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max {STATIC_VARIABLES.MAX_FILE_SIZE_MB}MB each)
                        </p>
                      </div>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h3>
                        <button 
                          type="button"
                          onClick={() => setFiles([])}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove All
                        </button>
                      </div>
                      <ul className="divide-y divide-gray-200">
                        {files.map((file, index) => (
                          <li key={index} className="py-2 flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Print Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'bw', label: 'Black & White' },
                          { value: 'color', label: 'Color' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setPrintType(option.value as PrintType)}
                            className={`${printType === option.value
                                ? 'bg-white border-indigo-600 text-indigo-600 ring-2 ring-indigo-600'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-600'
                              } border rounded-xl py-3 px-4 flex items-center justify-center text-sm font-medium transition-all duration-200`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Print Side</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'single', label: 'Single-sided' },
                          { value: 'double', label: 'Double-sided' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setPrintSide(option.value as PrintSide)}
                            className={`${printSide === option.value
                                ? 'bg-white border-indigo-600 text-indigo-600 ring-2 ring-indigo-600'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-600'
                              } border rounded-xl py-3 px-4 flex items-center justify-center text-sm font-medium transition-all duration-200`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Number of Copies
                      </label>
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          type="button"
                          onClick={() => copies > STATIC_VARIABLES.MIN_COPIES && setCopies(copies - 1)}
                          className="p-2 rounded-lg border border-gray-200 hover:border-indigo-600 transition-colors duration-200 w-10 h-10 flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="copies"
                          min={STATIC_VARIABLES.MIN_COPIES}
                          max={STATIC_VARIABLES.MAX_COPIES}
                          value={copies}
                          onChange={(e) => setCopies(parseInt(e.target.value) || STATIC_VARIABLES.MIN_COPIES)}
                          className="block w-20 text-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => copies < STATIC_VARIABLES.MAX_COPIES && setCopies(copies + 1)}
                          className="p-2 rounded-lg border border-gray-200 hover:border-indigo-600 transition-colors duration-200 w-10 h-10 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={files.length === 0 || isUploading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isUploading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading...
                      </div>
                    ) : (
                      `Upload ${files.length > 0 ? `${files.length} ${files.length === 1 ? 'File' : 'Files'}` : 'Files'} for Printing`
                    )}
                  </button>
                </form>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Footer = () => (
  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <Printer className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">PrintFlow</span>
      </div>
      <p className="text-xs text-gray-500">Digital Print Management Solution</p>
    </div>
  </div>
);

export default UploadPage;