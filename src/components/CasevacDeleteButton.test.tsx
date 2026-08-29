import { beforeEach, describe, expect, it, vi } from 'vitest';

import axios from '@/axios_config';
import { apiRoutes } from '@/apiRoutes';
import { fireEvent, render, screen, waitFor } from '../../test-utils';

import CasevacDeleteButton from './CasevacDeleteButton';

vi.mock('@/axios_config', () => ({
  default: {
    delete: vi.fn(),
  },
}));

vi.mock('i18next', () => ({ t: (key: string) => key }));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('CASEVAC map delete action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirms a network delete before removing the selected CASEVAC', async () => {
    const onDeleted = vi.fn();
    vi.mocked(axios.delete).mockResolvedValue({ status: 200 });

    render(
      <CasevacDeleteButton
        casevac={{ uid: 'casevac-123', title: 'MED.29.164608' }}
        onDeleted={onDeleted}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete CASEVAC' }));

    expect(
      await screen.findByText('Delete this CASEVAC from the server and connected TAK devices?'),
    ).toBeInTheDocument();
    expect(axios.delete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Delete from network' }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(apiRoutes.casevac, {
        params: { uid: 'casevac-123' },
      });
      expect(onDeleted).toHaveBeenCalledWith('casevac-123');
    });
  });
});
