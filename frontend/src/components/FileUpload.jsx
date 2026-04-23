import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
};

export default function FileUpload({ onFileSelect, isLoading, error }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
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
    maxSize: 200 * 1024 * 1024,
    disabled: isLoading,
  });

  return (
    <div className="upload-container mb-xl">
      <div 
        {...getRootProps()} 
        className={`upload-dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${selectedFile ? 'has-file' : ''} ${isLoading ? 'loading' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isLoading && <div className="scanning-line" /> }

        {isLoading ? (
          <div className="upload-prompt flex-column items-center slide-up">
            <Loader2 className="text-accent mb-md animate-spin" size={40} />
            <h2 className="section-heading__label mb-xs">Neural Synthesis</h2>
            <p className="text-secondary">Analyzing institutional datasets...</p>
          </div>
        ) : selectedFile ? (
          <div className="upload-success flex-column items-center slide-up">
            <CheckCircle className="text-accent mb-sm" size={48} />
            <h3 className="section-heading__label mb-xs">Document Secured</h3>
            <p className="text-primary font-bold">{selectedFile.name}</p>
            <p className="text-muted" style={{ fontSize: '12px' }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready for intelligence audit
            </p>
            <button className="btn-secondary mt-md">Replace File</button>
          </div>
        ) : (
          <div className="upload-prompt flex-column items-center">
            <div className="upload-icon-wrapper mb-md" style={{ background: 'var(--bg-blue-light)', padding: '20px', borderRadius: '50%' }}>
              <Upload className="text-accent" size={32} />
            </div>
            <h2 className="section-heading__label mb-xs">Document Intelligence</h2>
            <p className="text-secondary mb-lg">Drag & drop PDF, Excel, or CSV</p>
            <div className="d-flex items-center gap-4 text-muted" style={{ fontSize: '11px', fontWeight: 600 }}>
              <span className="d-flex items-center gap-2"><FileText size={14} /> PDF / Excel</span>
              <span className="d-flex items-center gap-2"><FileText size={14} /> CSV</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-badge mt-md slide-up d-flex items-start gap-2" style={{ color: 'var(--accent-rose)', background: 'rgba(225, 29, 72, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(225, 29, 72, 0.1)', fontSize: '14px', fontWeight: 500, lineHeight: '1.5', textAlign: 'left' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
