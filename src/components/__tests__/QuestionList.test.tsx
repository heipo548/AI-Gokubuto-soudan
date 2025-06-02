import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionList from '../QuestionList'; // Adjust path as needed
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

// Mock QuestionCard to simplify testing QuestionList
jest.mock('../QuestionCard', () => (props: any) => (
  <div data-testid="question-card">
    <h2 data-testid={`question-title-${props.id}`}>{props.title}</h2>
    <p>{props.content}</p>
    <p>Category: {props.category}</p>
  </div>
));

// Mock Spinner
jest.mock('../Spinner', () => () => <div data-testid="spinner">Loading...</div>);

const mockQuestion = (id: string, title: string, category: string = 'AI') => ({
  id,
  title,
  content: `Content for ${title}`,
  category,
  submitter_nickname: 'Tester',
  created_at: new Date().toISOString(),
  status: 'approved',
  like_count: 0,
  comment_count: 0,
});

describe('QuestionList Pagination', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  const mockApiResponse = (questions: any[], totalCount: number, page: number, limit: number = 10) => ({
    questions,
    totalCount,
    page,
    limit,
  });

  test('Test Case 1: Initial render (first page)', async () => {
    const page1Questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`q${i+1}`, `Question ${i+1}`));
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse(page1Questions, 25, 1),
    });

    render(<QuestionList selectedCategory="all" />);

    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    expect(screen.getAllByTestId('question-card')).toHaveLength(10);
    expect(screen.getByText(`Question 1`)).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeDisabled();
    expect(screen.getByText('Next')).toBeEnabled();
    expect(screen.getByText('Showing 1 - 10 of 25 questions')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument(); // 25 items, 10 per page = 3 pages
  });

  test('Test Case 2: Clicking "Next" button', async () => {
    const page1Questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`q${i+1}`, `Question ${i+1}`));
    const page2Questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`q${i+11}`, `Question ${i+11}`));

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // Initial load (page 1)
        ok: true,
        json: async () => mockApiResponse(page1Questions, 25, 1),
      })
      .mockResolvedValueOnce({ // Load after clicking Next (page 2)
        ok: true,
        json: async () => mockApiResponse(page2Questions, 25, 2),
      });

    render(<QuestionList selectedCategory="all" />);
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());

    await act(async () => {
      userEvent.click(screen.getByText('Next'));
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenLastCalledWith('/api/questions?page=2&limit=10&category=all');

    expect(screen.getAllByTestId('question-card')).toHaveLength(10);
    expect(screen.getByText(`Question 11`)).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeEnabled();
    expect(screen.getByText('Next')).toBeEnabled(); // Still page 2 of 3
    expect(screen.getByText('Showing 11 - 20 of 25 questions')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  test('Test Case 3: Clicking "Previous" button', async () => {
    const page1Questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`q${i+1}`, `Question ${i+1}`));
    const page2Questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`q${i+11}`, `Question ${i+11}`));

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // Initial load (page 1 for setup)
        ok: true,
        json: async () => mockApiResponse(page1Questions, 25, 1),
      })
      .mockResolvedValueOnce({ // Load for page 2
        ok: true,
        json: async () => mockApiResponse(page2Questions, 25, 2),
      })
      .mockResolvedValueOnce({ // Load for page 1 (after clicking Previous)
        ok: true,
        json: async () => mockApiResponse(page1Questions, 25, 1),
      });

    render(<QuestionList selectedCategory="all" />);
    // Initial load to page 1
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());

    // Go to page 2
    await act(async () => {
      userEvent.click(screen.getByText('Next'));
    });
    await waitFor(() => expect(screen.getByText('Page 2 of 3')).toBeInTheDocument());
    expect(screen.getByText(`Question 11`)).toBeInTheDocument();


    // Click Previous
    await act(async () => {
      userEvent.click(screen.getByText('Previous'));
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(fetch).toHaveBeenLastCalledWith('/api/questions?page=1&limit=10&category=all');

    expect(screen.getAllByTestId('question-card')).toHaveLength(10);
    expect(screen.getByText(`Question 1`)).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeDisabled();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  test('Test Case 4: Last page', async () => {
    const page1Questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`q${i+1}`, `Question ${i+1}`));
    const page2Questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`q${i+11}`, `Question ${i+11}`));
    const page3Questions = Array.from({ length: 5 }, (_, i) => mockQuestion(`q${i+21}`, `Question ${i+21}`));

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse(page1Questions, 25, 1) }) // Page 1
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse(page2Questions, 25, 2) }) // Page 2
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse(page3Questions, 25, 3) }); // Page 3

    render(<QuestionList selectedCategory="all" />);
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());

    await act(async () => { userEvent.click(screen.getByText('Next')); }); // Go to Page 2
    await waitFor(() => expect(screen.getByText('Page 2 of 3')).toBeInTheDocument());

    await act(async () => { userEvent.click(screen.getByText('Next')); }); // Go to Page 3
    await waitFor(() => expect(screen.getByText('Page 3 of 3')).toBeInTheDocument());

    expect(fetch).toHaveBeenLastCalledWith('/api/questions?page=3&limit=10&category=all');
    expect(screen.getAllByTestId('question-card')).toHaveLength(5);
    expect(screen.getByText(`Question 21`)).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeEnabled();
    expect(screen.getByText('Next')).toBeDisabled();
    expect(screen.getByText('Showing 21 - 25 of 25 questions')).toBeInTheDocument();
  });

  test('Test Case 5: No questions', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse([], 0, 1),
    });

    render(<QuestionList selectedCategory="all" />);

    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    expect(screen.getByText('該当する質問はありません。')).toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.queryByText(/Showing .* questions/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Page .* of .*/)).not.toBeInTheDocument();
  });

  test('Test Case 6: Category change resets to page 1', async () => {
    const aiPage1Questions = [mockQuestion('ai1', 'AI Question 1', 'AI')];
    const aiPage2Questions = [mockQuestion('ai2', 'AI Question 2', 'AI')];
    const techPage1Questions = [mockQuestion('tech1', 'Tech Question 1', '都市伝説')];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ // Initial load: AI, Page 1
        ok: true,
        json: async () => mockApiResponse(aiPage1Questions, 15, 1), // 15 total AI questions -> 2 pages
      })
      .mockResolvedValueOnce({ // AI, Page 2
        ok: true,
        json: async () => mockApiResponse(aiPage2Questions, 15, 2),
      })
      .mockResolvedValueOnce({ // Tech, Page 1
        ok: true,
        json: async () => mockApiResponse(techPage1Questions, 5, 1), // 5 tech questions -> 1 page
      });

    const { rerender } = render(<QuestionList selectedCategory="AI" />);

    // Load AI Page 1
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('AI Question 1')).toBeInTheDocument();
    });

    // Go to AI Page 2
    await act(async () => {
      userEvent.click(screen.getByText('Next'));
    });
    await waitFor(() => {
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      expect(screen.getByText('AI Question 2')).toBeInTheDocument();
      expect(fetch).toHaveBeenLastCalledWith('/api/questions?page=2&limit=10&category=AI');
    });

    // Change category to '都市伝説'
    act(() => {
      rerender(<QuestionList selectedCategory="都市伝説" />);
    });

    // Should fetch Page 1 of '都市伝説'
    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith('/api/questions?page=1&limit=10&category=%E9%83%BD%E5%B8%82%E4%BC%9D%E8%AA%AC'); // 都市伝説 URI encoded
    });

    await waitFor(() => {
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
        expect(screen.getByText('Tech Question 1')).toBeInTheDocument();
    });
    // Ensure current page is reset and displayed correctly
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });
});
