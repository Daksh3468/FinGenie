import { render, screen } from '@testing-library/react';
import Recommendations from '../../components/Recommendations';

const mockRecs = [
  'Reduce operational expenses by 15% over the next quarter.',
  'Increase working capital by negotiating better payment terms.',
  'Diversify revenue streams to reduce market concentration risk.',
];

describe('Recommendations', () => {
  it('returns null when recommendations is undefined', () => {
    const { container } = render(<Recommendations recommendations={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when recommendations is empty array', () => {
    const { container } = render(<Recommendations recommendations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders section heading when recommendations are provided', () => {
    render(<Recommendations recommendations={mockRecs} />);
    expect(screen.getByText('Actionable Recommendations')).toBeInTheDocument();
  });

  it('renders all recommendation texts', () => {
    render(<Recommendations recommendations={mockRecs} />);
    expect(screen.getByText(mockRecs[0])).toBeInTheDocument();
    expect(screen.getByText(mockRecs[1])).toBeInTheDocument();
    expect(screen.getByText(mockRecs[2])).toBeInTheDocument();
  });

  it('renders numbered index for each recommendation starting at 1', () => {
    render(<Recommendations recommendations={mockRecs} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders correct count of recommendation items', () => {
    render(<Recommendations recommendations={mockRecs} />);
    // Each numbered index is rendered once per recommendation
    expect(screen.getAllByText(/^\d+$/).length).toBe(mockRecs.length);
  });

  it('renders single recommendation correctly', () => {
    render(<Recommendations recommendations={['Cut costs by 10%.']} />);
    expect(screen.getByText('Cut costs by 10%.')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders with many recommendations', () => {
    const many = Array.from({ length: 10 }, (_, i) => `Recommendation ${i + 1}`);
    render(<Recommendations recommendations={many} />);
    expect(screen.getByText('Recommendation 1')).toBeInTheDocument();
    expect(screen.getByText('Recommendation 10')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('indexes increment correctly for each item', () => {
    render(<Recommendations recommendations={mockRecs} />);
    const indices = screen.getAllByText(/^\d+$/);
    expect(indices[0].textContent).toBe('1');
    expect(indices[1].textContent).toBe('2');
    expect(indices[2].textContent).toBe('3');
  });

  it('does not render section heading when list is empty', () => {
    const { container } = render(<Recommendations recommendations={[]} />);
    expect(container.querySelector('h2')).toBeNull();
  });
});
