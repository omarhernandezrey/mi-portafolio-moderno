/**
 * @jest-environment jsdom
 */

/**
 * T-30: `window.confirm` nativo → `ConfirmDialog` del sistema en
 * FeedPostRowActions y FeedCommentRowActions. Borrar ya no dispara el
 * DELETE directo; abre el diálogo primero.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

import FeedPostRowActions from '@/components/admin/FeedPostRowActions';
import FeedCommentRowActions from '@/components/admin/FeedCommentRowActions';

beforeEach(() => {
  mockAdminFetch.mockReset();
  mockRefresh.mockReset();
});

describe('FeedPostRowActions — borrar con ConfirmDialog (T-30)', () => {
  it('clic en «Eliminar» abre el diálogo sin mandar el DELETE; confirmar sí lo manda', async () => {
    mockAdminFetch.mockResolvedValue(undefined);
    render(
      <ToastProvider>
        <FeedPostRowActions postId="post-1" status="published" pinned={false} canWrite canPin canDelete />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar publicación' }));
    expect(mockAdminFetch).not.toHaveBeenCalled();

    const dialogo = await screen.findByRole('dialog', { name: 'Eliminar publicación' });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/feed/posts/post-1', { method: 'DELETE' }),
    );
    await waitFor(() => expect(dialogo).not.toBeInTheDocument());
  });
});

describe('FeedCommentRowActions — borrar con ConfirmDialog (T-30)', () => {
  it('clic en «Eliminar» abre el diálogo sin mandar el DELETE; confirmar sí lo manda', async () => {
    mockAdminFetch.mockResolvedValue(undefined);
    render(
      <ToastProvider>
        <FeedCommentRowActions commentId="comment-1" status="published" canWrite canDelete />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(mockAdminFetch).not.toHaveBeenCalled();

    const dialogo = await screen.findByRole('dialog', { name: 'Eliminar comentario' });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/feed/comments/comment-1', { method: 'DELETE' }),
    );
  });
});
