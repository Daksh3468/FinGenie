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
        {isLoading && <div className="scanning-line"></div>}
        
        <input {...getInputProps()} id="file-input" />
        
        <div className="upload-icon" style={{fontSize: '48px', marginBottom: '8px', filter: isLoading ? 'drop-shadow(0 0 10px var(--accent-blue))' : 'none'}}>{getIcon()}</div>
        <p className="upload-message" style={{fontSize: '20px', fontWeight: 800, color: isLoading ? 'var(--accent-blue)' : 'var(--bg-navy)'}}>{getMessage()}</p>
        
        <div style={{minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
          {isLoading ? (
            <div className="upload-progress" style={{marginTop: '0'}}>
              <div className="sub-label" style={{textAlign: 'center', marginBottom: '12px', color: 'var(--accent-blue)', opacity: 0.8}}>Neural Synthesis in progress</div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <div style={{marginTop: '16px', fontSize: '11px', fontWeight: 700, textAlign: 'center', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                Ephemeral Sandbox Mode Active
              </div>
            </div>
          ) : (
            !selectedFile && (
              <>
                <p className="upload-hint" style={{marginTop: '0', marginBottom: '24px', maxWidth: '340px', textAlign: 'center', lineHeight: 1.6}}>
                  {getHint()}
                </p>
                <button className="btn-dark" style={{padding: '14px 48px', fontSize: '14px'}}>SELECT FINANCIAL FILES</button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
