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
        style={{
          border: '2px dashed var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          transition: 'all 0.3s ease',
          background: isDragActive ? 'var(--bg-blue-light)' : 'white',
          boxShadow: isDragActive ? 'var(--shadow-lg)' : 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading && <div className="scanning-line"></div>}
        
        <input {...getInputProps()} id="file-input" />
        
        <div className="upload-icon" style={{fontSize: '56px', marginBottom: 'var(--space-sm)', filter: isLoading ? 'drop-shadow(0 0 10px var(--accent-blue))' : 'none', transition: 'transform 0.3s ease'}}>{getIcon()}</div>
        <p className="upload-message" style={{fontSize: '22px', fontWeight: 900, marginBottom: 'var(--space-xs)', color: isLoading ? 'var(--accent-blue)' : 'var(--bg-navy)'}}>{getMessage()}</p>
        
        <div style={{minHeight: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
          {isLoading ? (
            <div className="upload-progress" style={{marginTop: '0', width: '100%', maxWidth: '400px'}}>
              <div className="sub-label" style={{textAlign: 'center', marginBottom: '12px', color: 'var(--accent-blue)', opacity: 0.8, fontSize: '13px'}}>Neural Synthesis in progress</div>
              <div className="progress-bar" style={{height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden'}}>
                <div className="progress-fill" style={{height: '100%', background: 'var(--gradient-primary)', width: '60%', borderRadius: '4px'}}></div>
              </div>
              <div style={{marginTop: '16px', fontSize: '11px', fontWeight: 700, textAlign: 'center', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                Ephemeral Sandbox Mode Active
              </div>
            </div>
          ) : (
            <>
              {!selectedFile && (
                <p className="upload-hint" style={{marginTop: '0', marginBottom: 'var(--space-md)', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '15px'}}>
                  {getHint()}
                </p>
              )}
              <button 
                className="btn-primary" 
                style={{
                  padding: '14px 48px', 
                  fontSize: '16px', 
                  fontWeight: 700,
                  transition: 'all 0.3s ease'
                }}
              >
                {selectedFile ? 'REPLACE FILE' : 'SELECT FINANCIAL FILES'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
