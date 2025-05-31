// src/app/submit/__tests__/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import SubmitPage from '../page'; // Adjust path as necessary

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

describe('SubmitPage', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should show error from backend when submitting without category', async () => {
    render(<SubmitPage />);

    // Fill in title and content
    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByLabelText(/質問内容/), {
      target: { value: 'Test Content' },
    });

    // Mock the fetch call for submitting a question
    // The original frontend validation for category is removed,
    // so we expect the API to return an error.
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: '有効なカテゴリーを選択してください。' }),
      { status: 400 }
    );

    // Click submit button
    fireEvent.click(screen.getByRole('button', { name: /投稿する/i }));

    // Wait for error message to appear
    // The error message "有効なカテゴリーを選択してください。" is expected from the backend.
    await waitFor(() => {
      expect(screen.getByText('有効なカテゴリーを選択してください。')).toBeInTheDocument();
    });

    // Ensure fetch was called correctly (without category or with empty category)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/questions',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringMatching(/"title":"Test Title","content":"Test Content","category":null,"notification_token":"[a-f0-9-]+"/),
      })
    );
  });
});
