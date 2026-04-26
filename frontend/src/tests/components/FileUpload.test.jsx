import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import FileUpload from '../../components/FileUpload';

// ── Mock react-dropzone ────────────────────────────────────────────────────
const mockDropzoneState = {
  getRootProps: () => ({ 'data-testid': 'dropzone-root', onClick: vi.fn() }),
  getInputProps: () => ({ 'data-testid': 'file-input' }),
  isDragActive: false,
  isDragReject: false,
};

const useDropzoneMock = vi.fn(() => mockDropzoneState);

//  declare outside
let mockOnDrop = vi.fn();

vi.mock('react-dropzone', () => ({
  useDropzone: (config) => {
    // ✅ assign here properly
    mockOnDrop = config.onDrop;

    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
      isDragReject: false,
    };
  },
}));


vi.mock('react-dropzone', () => ({
  useDropzone: (...args) => useDropzoneMock(...args),
}));

afterEach(() => {
  useDropzoneMock.mockClear();
  useDropzoneMock.mockReturnValue(mockDropzoneState);
  vi.restoreAllMocks();
});

describe('FileUpload', () => {
  // ── default idle state ────────────────────────────────────────────────────
  it('renders the upload dropzone', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.getByTestId('dropzone-root')).toBeInTheDocument();
  });

  it('shows "Document Intelligence" heading in idle state', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.getByText('Document Intelligence')).toBeInTheDocument();
  });

  it('shows drag & drop instruction text', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument();
  });

  it('shows file format hints (PDF / Excel, CSV)', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.getByText('PDF / Excel')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('passes correct accept types to useDropzone', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    const [options] = useDropzoneMock.mock.calls[0];

    expect(options.accept).toHaveProperty('application/pdf');
    expect(options.accept).toHaveProperty('text/csv');
    expect(options.accept).toHaveProperty(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  });

  it('uses maxFiles: 1', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    const [options] = useDropzoneMock.mock.calls[0];
    expect(options.maxFiles).toBe(1);
  });

  it('uses 200MB maxSize', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    const [options] = useDropzoneMock.mock.calls[0];
    expect(options.maxSize).toBe(200 * 1024 * 1024);
  });

  // ── drag active ────────────────────────────────────────────────────────────
  it('applies "active" class when isDragActive is true', () => {
    useDropzoneMock.mockReturnValue({ ...mockDropzoneState, isDragActive: true });

    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.getByTestId('dropzone-root').className).toContain('active');
  });

  // ── drag reject ───────────────────────────────────────────────────────────
  it('applies "reject" class when isDragReject is true', () => {
    useDropzoneMock.mockReturnValue({ ...mockDropzoneState, isDragReject: true });

    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.getByTestId('dropzone-root').className).toContain('reject');
  });

  // ── file selected ─────────────────────────────────────────────────────────
  it('calls onFileSelect with the dropped file', () => {
    const onFileSelect = vi.fn();
    let capturedOnDrop;

    useDropzoneMock.mockImplementation((opts) => {
      capturedOnDrop = opts.onDrop;
      return mockDropzoneState;
    });

    render(<FileUpload onFileSelect={onFileSelect} />);

    const mockFile = new File(['data'], 'report.pdf', {
      type: 'application/pdf',
    });

    act(() => {
      capturedOnDrop([mockFile]);
    });

    expect(onFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it('ignores drop when acceptedFiles is empty', () => {
    const onFileSelect = vi.fn();
    let capturedOnDrop;

    useDropzoneMock.mockImplementation((opts) => {
      capturedOnDrop = opts.onDrop;
      return mockDropzoneState;
    });

    render(<FileUpload onFileSelect={onFileSelect} />);

    act(() => {
      capturedOnDrop([]);
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('shows file name and UI after selection', () => {
    let capturedOnDrop;

    useDropzoneMock.mockImplementation((opts) => {
      capturedOnDrop = opts.onDrop;
      return mockDropzoneState;
    });

    render(<FileUpload onFileSelect={vi.fn()} />);

    const file = new File(['data'], 'financial.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    act(() => {
      capturedOnDrop([file]);
    });

    expect(screen.getByText('financial.xlsx')).toBeInTheDocument();
    expect(screen.getByText('Document Secured')).toBeInTheDocument();
  });

  it('shows "Replace File" button after file selected', () => {
    let capturedOnDrop;

    useDropzoneMock.mockImplementation((opts) => {
      capturedOnDrop = opts.onDrop;
      return mockDropzoneState;
    });

    render(<FileUpload onFileSelect={vi.fn()} />);

    act(() => {
      capturedOnDrop([new File(['x'], 'test.csv', { type: 'text/csv' })]);
    });

    expect(screen.getByText('Replace File')).toBeInTheDocument();
  });

  it('applies "has-file" class after file is dropped', () => {
    let capturedOnDrop;

    useDropzoneMock.mockImplementation((opts) => {
      capturedOnDrop = opts.onDrop;
      return mockDropzoneState;
    });

    render(<FileUpload onFileSelect={vi.fn()} />);

    act(() => {
      capturedOnDrop([new File(['x'], 'data.csv', { type: 'text/csv' })]);
    });

    expect(screen.getByTestId('dropzone-root').className).toContain('has-file');
  });

  // ── loading state ─────────────────────────────────────────────────────────
  it('shows Neural Synthesis heading when isLoading is true', () => {
    render(<FileUpload onFileSelect={vi.fn()} isLoading />);
    expect(screen.getByText('Neural Synthesis')).toBeInTheDocument();
  });

  it('shows analyzing text while loading', () => {
    render(<FileUpload onFileSelect={vi.fn()} isLoading />);
    expect(
      screen.getByText(/Analyzing institutional datasets/i)
    ).toBeInTheDocument();
  });

  it('disables dropzone while loading', () => {
    render(<FileUpload onFileSelect={vi.fn()} isLoading />);

    // Find ANY call where disabled === true (safer than index 0)
    const disabledCall = useDropzoneMock.mock.calls.find(
      ([options]) => options.disabled === true
    );

    expect(disabledCall).toBeTruthy();
  });

  it('applies "loading" class when isLoading is true', () => {
    render(<FileUpload onFileSelect={vi.fn()} isLoading />);
    expect(screen.getByTestId('dropzone-root').className).toContain('loading');
  });

  // ── error state ───────────────────────────────────────────────────────────
  it('shows error message when error prop is provided', () => {
    render(<FileUpload onFileSelect={vi.fn()} error="File too large" />);
    expect(screen.getByText('File too large')).toBeInTheDocument();
  });

  it('does NOT show error section when error is not provided', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.queryByText('File too large')).toBeNull();
  });

  //  it('calls onFileSelect when a file is dropped', () => {
  //   const mockSelect = vi.fn();

  //   render(<FileUpload onFileSelect={mockSelect} isLoading={false} />);

  //   const file = new File(['data'], 'test.csv', { type: 'text/csv' });

  //   // ensure it's defined before calling
  //   expect(mockOnDrop).toBeDefined();

  //   mockOnDrop([file]);

  //   expect(mockSelect).toHaveBeenCalledWith(file);
  // });

  // it('does not call onFileSelect when no file is dropped', () => {
  //   const mockSelect = vi.fn();

  //   render(<FileUpload onFileSelect={mockSelect} isLoading={false} />);

  //   expect(mockOnDrop).toBeDefined();

  //   mockOnDrop([]);

  //   expect(mockSelect).not.toHaveBeenCalled();
  // });

});