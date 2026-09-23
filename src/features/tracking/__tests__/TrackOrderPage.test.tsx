import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockApi } from '@/api/trackingApi';
import { ToastProvider } from '@/components/ui/Toast';
import { TrackOrderPage } from '../TrackOrderPage';

function renderScenario(id: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/track/${id}`]}>
        <Routes>
          <Route path="/track/:scenarioId" element={<TrackOrderPage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

const WAIT = { timeout: 4000 };

describe('TrackOrderPage', () => {
  beforeEach(() => resetMockApi());

  it('shows a skeleton, then the status hero and support', async () => {
    renderScenario('out-for-delivery');
    expect(screen.getByText('Loading tracking details…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Out for Delivery', level: 2 }, WAIT)).toBeInTheDocument();
    expect(screen.getByText(/Arriving Thu, Sep 26 · 2–6\sPM/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact Support' })).toBeInTheDocument();
  });

  it('recovers from a failed request with Try again', async () => {
    const user = userEvent.setup();
    renderScenario('network-error');
    expect(await screen.findByRole('alert', {}, WAIT)).toHaveTextContent('Couldn’t load tracking');
    expect(screen.getByRole('button', { name: 'Contact Support' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Out for Delivery' }, WAIT)).toBeInTheDocument();
  });

  it('walks through reporting a delivered package as missing', async () => {
    const user = userEvent.setup();
    renderScenario('delivered');
    await user.click(await screen.findByRole('button', { name: /Didn’t receive your package/ }, WAIT));

    const sheet = screen.getByRole('dialog', { name: 'Let’s find your package' });
    await user.click(within(sheet).getByRole('checkbox', { name: /Check around your door/ }));
    expect(within(sheet).getByText('1 of 4 checked')).toBeInTheDocument();

    await user.click(within(sheet).getByRole('button', { name: 'Report missing package' }));
    expect(await screen.findByRole('heading', { name: /case #CS-10492 opened/ }, WAIT)).toBeInTheDocument();
    expect(screen.getByText('Reported not received')).toBeInTheDocument();
  });

  it('expands tracking history and extra order items', async () => {
    const user = userEvent.setup();
    renderScenario('out-for-delivery');
    await user.click(await screen.findByRole('button', { name: /View detailed tracking history/ }, WAIT));
    expect(screen.getByRole('list', { name: 'Carrier scan events' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '+2 more items' }));
    expect(screen.getByText('Canvas Weekender Tote')).toBeInTheDocument();
  });
});
