import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DataPreview from '../../components/DataPreview';

const makeRows = (n) =>
  Array.from({ length: n }, (_, i) => ({ Item: `Row ${i + 1}`, Amount: (i + 1) * 100 }));

const columns = ['Item', 'Amount'];

describe('DataPreview', () => {
  // ── null / empty guards ──────────────────────────────────────────────────
  it('returns null when data is undefined', () => {
    const { container } = render(<DataPreview columns={columns} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when data is null', () => {
    const { container } = render(<DataPreview data={null} columns={columns} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when data is empty array', () => {
    const { container } = render(<DataPreview data={[]} columns={columns} />);
    expect(container.firstChild).toBeNull();
  });

  // ── basic render ─────────────────────────────────────────────────────────
  it('renders "Raw Data Ledger" heading', () => {
    render(<DataPreview data={makeRows(3)} columns={columns} />);
    expect(screen.getByText('Raw Data Ledger')).toBeInTheDocument();
  });

  it('renders statementType badge when provided', () => {
    render(<DataPreview data={makeRows(3)} columns={columns} statementType="INCOME" />);
    expect(screen.getByText('INCOME')).toBeInTheDocument();
  });

  it('does NOT render badge when statementType is absent', () => {
    render(<DataPreview data={makeRows(3)} columns={columns} />);
    expect(screen.queryByText('INCOME')).toBeNull();
  });

  // ── row slicing ──────────────────────────────────────────────────────────
  it('shows exactly 8 rows when collapsed and data has 8 rows', () => {
    render(<DataPreview data={makeRows(8)} columns={columns} />);
    expect(screen.getAllByText(/^Row \d+$/)).toHaveLength(8);
  });

  it('shows only first 8 rows when data has more than 8', () => {
    render(<DataPreview data={makeRows(12)} columns={columns} />);
    expect(screen.getAllByText(/^Row \d+$/)).toHaveLength(8);
    expect(screen.queryByText('Row 9')).toBeNull();
  });

  it('shows all rows when data has fewer than 8', () => {
    render(<DataPreview data={makeRows(5)} columns={columns} />);
    expect(screen.getAllByText(/^Row \d+$/)).toHaveLength(5);
  });

  // ── MORE RECORDS footer ──────────────────────────────────────────────────
  it('shows "+ N MORE RECORDS" footer when data > 8 and collapsed', () => {
    render(<DataPreview data={makeRows(12)} columns={columns} />);
    expect(screen.getByText('+ 4 MORE RECORDS')).toBeInTheDocument();
  });

  it('does NOT show MORE RECORDS when data has exactly 8 rows', () => {
    render(<DataPreview data={makeRows(8)} columns={columns} />);
    expect(screen.queryByText(/MORE RECORDS/)).toBeNull();
  });

  it('does NOT show MORE RECORDS when data has fewer than 8 rows', () => {
    render(<DataPreview data={makeRows(5)} columns={columns} />);
    expect(screen.queryByText(/MORE RECORDS/)).toBeNull();
  });

  // ── expand / collapse ────────────────────────────────────────────────────
  it('collapse button label says "Show All (N rows)" when collapsed', () => {
    render(<DataPreview data={makeRows(12)} columns={columns} />);
    expect(screen.getByText('Show All (12 rows)')).toBeInTheDocument();
  });

  // FIX: click the "Show All" button directly instead of traversing DOM
  it('clicking "Show All" button expands to show all rows', () => {
    render(<DataPreview data={makeRows(12)} columns={columns} />);
    fireEvent.click(screen.getByText('Show All (12 rows)'));
    expect(screen.getAllByText(/^Row \d+$/)).toHaveLength(12);
  });

  it('shows "Collapse" button when expanded', () => {
    render(<DataPreview data={makeRows(12)} columns={columns} />);
    fireEvent.click(screen.getByText('Show All (12 rows)'));
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('clicking "Collapse" hides extra rows again', () => {
    render(<DataPreview data={makeRows(12)} columns={columns} />);
    fireEvent.click(screen.getByText('Show All (12 rows)'));
    fireEvent.click(screen.getByText('Collapse'));
    expect(screen.getAllByText(/^Row \d+$/)).toHaveLength(8);
  });

  it('clicking MORE RECORDS footer expands all rows', () => {
    render(<DataPreview data={makeRows(12)} columns={columns} />);
    fireEvent.click(screen.getByText('+ 4 MORE RECORDS'));
    expect(screen.getAllByText(/^Row \d+$/)).toHaveLength(12);
  });

  // ── formatCell ────────────────────────────────────────────────────────────
  it('renders "—" for null value', () => {
    render(<DataPreview data={[{ Item: 'Revenue', Amount: null }]} columns={columns} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders "—" for undefined value', () => {
    render(<DataPreview data={[{ Item: 'Revenue', Amount: undefined }]} columns={columns} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders "—" for empty-string value', () => {
    render(<DataPreview data={[{ Item: 'Revenue', Amount: '' }]} columns={columns} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('formats numeric values with locale commas', () => {
    render(<DataPreview data={[{ Item: 'Revenue', Amount: 1500000 }]} columns={columns} />);
    expect(screen.getByText('1,500,000')).toBeInTheDocument();
  });

  it('renders string values as-is in first column', () => {
    render(<DataPreview data={[{ Item: 'Operating Expenses', Amount: 200 }]} columns={columns} />);
    expect(screen.getByText('Operating Expenses')).toBeInTheDocument();
  });

  it('renders non-numeric string in numeric column via String()', () => {
    render(<DataPreview data={[{ Item: 'Revenue', Amount: 'N/A' }]} columns={columns} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  // ── column headers ────────────────────────────────────────────────────────
  it('renders all column headers', () => {
    render(<DataPreview data={makeRows(3)} columns={columns} />);
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });
});
