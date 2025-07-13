import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '../DashboardPage';
import axios from 'axios';

jest.mock('axios');

const mockStrategy = {
  currentMRR: '0',
  targetMRR: '100000',
  timeline: '2-3 years',
  immediateFocus: 'AI consulting',
  serviceOfferings: [{ name: 'AI Chatbots', priceRange: 'R2,000-R5,000' }],
  targetMarket: ['Cape Town businesses'],
  focus: 'Dystopian clothing',
  technology: 'LED fabrics',
  target: 'Tech-savvy',
  revenueModel: 'Direct-to-consumer',
  competitiveAdvantages: ['Claude CLI'],
  generated: '2025-07-09'
};

describe('DashboardPage - Business Strategy Editor', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockStrategy });
    axios.post.mockResolvedValue({});
  });

  it('renders all business strategy fields', async () => {
    render(<DashboardPage />);
    expect(await screen.findByLabelText(/Current MRR/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target MRR/i)).toHaveValue('100000');
    expect(screen.getByLabelText(/Timeline/i)).toHaveValue('2-3 years');
    expect(screen.getByLabelText(/Immediate Focus/i)).toHaveValue('AI consulting');
    expect(screen.getByLabelText(/Name/i)).toHaveValue('AI Chatbots');
    expect(screen.getByLabelText(/Price Range/i)).toHaveValue('R2,000-R5,000');
    expect(screen.getByLabelText(/Target Market #1/i)).toHaveValue('Cape Town businesses');
    expect(screen.getByLabelText(/Brand Focus/i)).toHaveValue('Dystopian clothing');
    expect(screen.getByLabelText(/Brand Technology/i)).toHaveValue('LED fabrics');
    expect(screen.getByLabelText(/Brand Target/i)).toHaveValue('Tech-savvy');
    expect(screen.getByLabelText(/Revenue Model/i)).toHaveValue('Direct-to-consumer');
    expect(screen.getByLabelText(/Advantage #1/i)).toHaveValue('Claude CLI');
    expect(screen.getByLabelText(/Generated/i)).toHaveValue('2025-07-09');
  });

  it('shows validation errors for required fields', async () => {
    render(<DashboardPage />);
    await screen.findByLabelText(/Current MRR/i);
    fireEvent.change(screen.getByLabelText(/Current MRR/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Save Strategy/i));
    expect(await screen.findByText(/Current MRR is required/i)).toBeInTheDocument();
  });

  it('shows numeric validation error', async () => {
    render(<DashboardPage />);
    await screen.findByLabelText(/Current MRR/i);
    fireEvent.change(screen.getByLabelText(/Current MRR/i), { target: { value: 'notanumber' } });
    fireEvent.click(screen.getByText(/Save Strategy/i));
    expect(await screen.findByText(/Must be a number/i)).toBeInTheDocument();
  });

  it('can add and remove service offerings', async () => {
    render(<DashboardPage />);
    await screen.findByLabelText(/Current MRR/i);
    fireEvent.click(screen.getByText(/Add Service Offering/i));
    expect(screen.getAllByLabelText(/Name/i).length).toBeGreaterThan(1);
    fireEvent.click(screen.getAllByText(/Remove/i)[0]);
    expect(screen.getAllByLabelText(/Name/i).length).toBe(1);
  });

  it('shows confirmation dialog and saves on confirm', async () => {
    render(<DashboardPage />);
    await screen.findByLabelText(/Current MRR/i);
    fireEvent.click(screen.getByText(/Save Strategy/i));
    expect(await screen.findByText(/Confirm Save/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Confirm/i));
    await waitFor(() => expect(screen.getByText(/Business strategy saved successfully/i)).toBeInTheDocument());
  });

  it('shows error on API failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('fail'));
    render(<DashboardPage />);
    await screen.findByLabelText(/Current MRR/i);
    fireEvent.click(screen.getByText(/Save Strategy/i));
    fireEvent.click(await screen.findByText(/Confirm/i));
    await waitFor(() => expect(screen.getByText(/Failed to save business strategy/i)).toBeInTheDocument());
  });
}); 