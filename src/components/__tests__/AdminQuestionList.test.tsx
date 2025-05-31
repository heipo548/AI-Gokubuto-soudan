// src/components/__tests__/AdminQuestionList.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import AdminQuestionList, { AdminQuestionProps } from '../AdminQuestionList'; // Adjust path

// Mock window.confirm
global.confirm = jest.fn(() => true); // Always confirm 'yes'

const mockQuestions: AdminQuestionProps[] = [
  { id: 1, title: 'Question 1 about AI', status: 'pending', created_at: new Date().toISOString() },
  { id: 2, title: 'Question 2 about Space', status: 'answered', created_at: new Date().toISOString() },
  { id: 3, title: 'Question 3 about History', status: 'pending', created_at: new Date().toISOString() },
];

describe('AdminQuestionList', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    // Mock the initial fetch for questions
    fetchMock.mockResponseOnce(JSON.stringify(mockQuestions));
    // Reset window.confirm mock for each test if needed, though global mock might be fine.
    (global.confirm as jest.Mock).mockClear().mockReturnValue(true);
  });

  it('should remove question from list when delete is successful', async () => {
    render(<AdminQuestionList filterStatus="all" />);

    // Wait for initial questions to load
    await waitFor(() => {
      expect(screen.getByText('Question 1 about AI')).toBeInTheDocument();
      expect(screen.getByText('Question 2 about Space')).toBeInTheDocument();
    });

    // Mock the successful DELETE request for the first question
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Question 1 deleted successfully' }), { status: 200 });

    // Find all delete buttons. The component renders a button with text "削除"
    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    // Click the delete button for the first question (Question 1)
    fireEvent.click(deleteButtons[0]);

    // Check that window.confirm was called
    expect(global.confirm).toHaveBeenCalledWith('本当に質問ID: 1 を削除しますか？この操作は取り消せません。');

    // Wait for the question to be removed and success message to appear
    await waitFor(() => {
      expect(screen.queryByText('Question 1 about AI')).not.toBeInTheDocument();
    });
    await waitFor(() => {
        expect(screen.getByText('質問ID: 1 が正常に削除されました。')).toBeInTheDocument();
    });

    // Verify fetch was called for deletion
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/questions/1', expect.objectContaining({ method: 'DELETE' }));

    // Ensure other questions are still there
    expect(screen.getByText('Question 2 about Space')).toBeInTheDocument();
  });

  it('should show error message when delete fails', async () => {
    render(<AdminQuestionList filterStatus="all" />);

    // Wait for initial questions to load
    await waitFor(() => {
      expect(screen.getByText('Question 1 about AI')).toBeInTheDocument();
    });

    // Mock the failed DELETE request
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Internal Server Error, could not delete' }), { status: 500 });

    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith('本当に質問ID: 1 を削除しますか？この操作は取り消せません。');

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Internal Server Error, could not delete/i)).toBeInTheDocument();
    });

    // Verify fetch was called for deletion
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/questions/1', expect.objectContaining({ method: 'DELETE' }));

    // Ensure the question is NOT removed from the list
    expect(screen.getByText('Question 1 about AI')).toBeInTheDocument();
  });
});
