// src/components/reports/UploadReportForm.jsx
import React, { useState } from 'react';
import { useReportStore } from '../../store/useReportStore';
import { Button, Input, Select, Upload, Alert, Progress } from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Form to upload a report file (Excel or CSV) with optional report name and type
 * 
 * @param {function} onSuccess - Callback function to call after successful upload
 * @returns {React.ReactElement} - The form component
 */
/*******  e2f53ce6-deeb-4cb3-9bd6-9fb4e2dd4d33  *******/const { Option } = Select;

const UploadReportForm = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('custom');
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [fileValidationError, setFileValidationError] = useState(null);
  
  const uploadReport = useReportStore(state => state.uploadReport);
  const isLoading = useReportStore(state => state.isLoading);
  
  const validateFile = (file) => {
    // Reset previous errors
    setFileValidationError(null);
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setFileValidationError("File size exceeds 10MB limit");
      return false;
    }
    
    // Check file extension
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      setFileValidationError(`Invalid file type. Allowed extensions: ${validExtensions.join(', ')}`);
      return false;
    }
    
    return true;
  };
  
  const handleFileChange = (info) => {
    const file = info.file.originFileObj || info.file;
    
    if (validateFile(file)) {
      setFile(file);
      // Auto-set report name from filename if not already set
      if (!reportName && file.name) {
        setReportName(file.name.split('.')[0]);
      }
    } else {
      // Clear the file if it's invalid
      setFile(null);
    }
  };
  
  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setUploadError(null);
    setProgress(0);
    
    try {
      await uploadReport(
        file, 
        reportName || file.name.split('.')[0], 
        reportType,
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      );
      
      toast.success('Report uploaded successfully');
      
      // Reset form
      setFile(null);
      setReportName('');
      setProgress(0);
      
      // Callback for parent component
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload report');
      toast.error(error.response?.data?.message || 'Failed to upload report');
    }
  };
  
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Upload Report Data</h3>
      
      {uploadError && (
        <Alert
          message="Upload Failed"
          description={uploadError}
          type="error"
          showIcon
          closable
          className="mb-4"
        />
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Report Name</label>
        <Input
          placeholder="Enter report name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Report Type</label>
        <Select
          value={reportType}
          onChange={(value) => setReportType(value)}
          className="w-full"
        >
          <Option value="sales">Sales Report</Option>
          <Option value="performance">Performance Report</Option>
          <Option value="financial">Financial Report</Option>
          <Option value="client">Client Report</Option>
          <Option value="custom">Custom Report</Option>
        </Select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Report File (Excel or CSV)</label>
        <Upload
          beforeUpload={() => false} // Prevent auto upload
          onChange={handleFileChange}
          fileList={file ? [file] : []}
          accept=".xlsx,.xls,.csv"
          maxCount={1}
          onRemove={() => setFile(null)}
          disabled={isLoading}
          showUploadList={{
            showPreviewIcon: false,
            showRemoveIcon: !isLoading
          }}
        >
          <Button 
            icon={<UploadOutlined />} 
            disabled={isLoading}
          >
            Select File
          </Button>
        </Upload>
        {fileValidationError && (
          <div className="mt-2 text-error text-sm flex items-center">
            <CloseCircleOutlined className="mr-1" /> {fileValidationError}
          </div>
        )}
        {file && !fileValidationError && (
          <div className="mt-2 text-success text-sm flex items-center">
            <CheckCircleOutlined className="mr-1" /> File ready for upload: {file.name}
          </div>
        )}
        <p className="text-xs text-base-content/60 mt-1">
          Supported formats: Excel (.xlsx, .xls), CSV (.csv)
        </p>
      </div>
      
      {progress > 0 && progress < 100 && (
        <div className="mb-4">
          <Progress percent={progress} status="active" />
        </div>
      )}
      
      <Button 
        type="primary" 
        onClick={handleSubmit} 
        loading={isLoading}
        disabled={!file || isLoading || fileValidationError}
        className="w-full"
      >
        Upload Report
      </Button>
    </div>
  );
};

export default UploadReportForm;