import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { Dashboard } from './Dashboard';
import { StadiumProvider } from '../contexts/StadiumContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Dashboard Component', () => {
  it('renders error state initially since no stadium is selected', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StadiumProvider>
          <Dashboard />
        </StadiumProvider>
      </QueryClientProvider>
    );
    // Since activeStadiumId is null by default in the Provider, it should render an error/empty state
    expect(screen.getByText('Error loading dashboard telemetry.')).toBeInTheDocument();
  });
});
