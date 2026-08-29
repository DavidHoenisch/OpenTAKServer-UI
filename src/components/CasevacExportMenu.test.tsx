import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { downloadCasevacExport, type CasevacExportData } from '@/casevacExport';
import { render, userEvent } from '../../test-utils';
import CasevacExportMenu from './CasevacExportMenu';

vi.mock('i18next', () => ({ t: (key: string) => key }));
vi.mock('@/casevacExport', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/casevacExport')>()),
  downloadCasevacExport: vi.fn(),
}));

const casevac: CasevacExportData = {
  uid: 'casevac-1',
  title: 'MED.28.192604',
  timestamp: '2026-08-29T17:30:00Z',
};

it('offers text and PDF downloads from the shared export control', async () => {
  const user = userEvent.setup();
  render(<CasevacExportMenu casevac={casevac} />);

  await user.click(screen.getByRole('button', { name: 'Export 9-Line' }));

  expect(await screen.findByText('Plain text (.txt)')).toBeInTheDocument();
  expect(await screen.findByText('Formatted PDF (.pdf)')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Plain text (.txt)'));
  expect(downloadCasevacExport).toHaveBeenCalledWith(casevac, 'txt');
});
