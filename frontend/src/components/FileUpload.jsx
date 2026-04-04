import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
};

export default function FileUpload({ onFileSelect, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      return;
    }
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 200 * 1024 * 1024, // 200MB
    disabled: isLoading,
  });

  const getIcon = () => {
    if (isLoading) return '⏳';
    if (isDragReject) return '❌';
    if (isDragActive) return '📂';
    if (selectedFile) return '✅';
    return '📊';
  };

  const getMessage = () => {
    if (isLoading) return 'Analyzing your data...';
    if (isDragReject) return 'Unsupported file type. Use PDF, Excel, CSV, or SEC ZIP.';
    if (isDragActive) return 'Drop your file here...';
    if (selectedFile) return `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)`;
    return 'Drag & drop financial document or SEC XBRL ZIP';
  };

  const getHint = () => {
    return 'Supports PDF, Excel, CSV, and SEC XBRL ZIP (sub, num, tag, pre) • Max 200MB';
  };

  return (
    <div className="upload-section" id="file-upload-section">
      <div
        {...getRootProps()}
        className={`upload-dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${isLoading ? 'loading' : ''} ${selectedFile ? 'has-file' : ''}`}
        id="file-dropzone"
      >
        <input {...getInputProps()} id="file-input" />
        <div className="upload-icon">{getIcon()}</div>
        <p className="upload-message">{getMessage()}</p>
        {!selectedFile && !isLoading && (
          <p className="upload-hint">{getHint()}</p>
        )}
        {isLoading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
