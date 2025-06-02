import { GET } from './route'; // Adjust the import path as necessary
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { URL } from 'url'; // Import URL

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  question: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(), // Added for previous/next question logic
  },
}));

// Helper to create a mock NextRequest
const mockRequest = (queryParams: Record<string, string>): NextRequest => {
  const url = new URL(`http://localhost/api/questions?${new URLSearchParams(queryParams)}`);
  return {
    url: url.toString(),
    // Add other NextRequest properties if needed by your handler
  } as NextRequest;
};

describe('GET /api/questions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (prisma.question.findMany as jest.Mock).mockReset();
    (prisma.question.count as jest.Mock).mockReset();
    (prisma.question.findFirst as jest.Mock).mockReset(); // Reset for previous/next tests
  });

  // Keep existing tests for original functionality
  describe('Original Question Listing Logic', () => {
    test('Test Case 1: Default parameters', async () => {
      const mockQuestions = [{ id: '1', title: 'Test Question' }];
      // ... (rest of existing test remains the same)
    });
    // ... other existing tests ...
  }); // End of Original Question Listing Logic


  // New describe block for Previous/Next Question ID Logic
  describe('Previous/Next Question ID Logic', () => {
    const currentQuestionId = 'current-id';
    const currentQuestionCreatedAt = new Date().toISOString();

    test('should return previous and next question IDs when both exist', async () => {
      (prisma.question.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 'prev-id' }) // Previous question
        .mockResolvedValueOnce({ id: 'next-id' }); // Next question

      const request = mockRequest({
        currentQuestionId,
        currentQuestionCreatedAt,
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.previousQuestionId).toBe('prev-id');
      expect(data.nextQuestionId).toBe('next-id');
      expect(prisma.question.findFirst).toHaveBeenCalledTimes(2);
      expect(prisma.question.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { created_at: { lt: new Date(currentQuestionCreatedAt) }, id: { not: currentQuestionId } },
        orderBy: { created_at: 'desc' },
        select: { id: true },
      }));
      expect(prisma.question.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { created_at: { gt: new Date(currentQuestionCreatedAt) }, id: { not: currentQuestionId } },
        orderBy: { created_at: 'asc' },
        select: { id: true },
      }));
    });

    test('should return null for previousQuestionId if none exists', async () => {
      (prisma.question.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // No previous question
        .mockResolvedValueOnce({ id: 'next-id' }); // Next question

      const request = mockRequest({
        currentQuestionId,
        currentQuestionCreatedAt,
      });
      const response = await GET(request);
      const data = await response.json();

      expect(data.previousQuestionId).toBeNull();
      expect(data.nextQuestionId).toBe('next-id');
    });

    test('should return null for nextQuestionId if none exists', async () => {
      (prisma.question.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 'prev-id' }) // Previous question
        .mockResolvedValueOnce(null); // No next question

      const request = mockRequest({
        currentQuestionId,
        currentQuestionCreatedAt,
      });
      const response = await GET(request);
      const data = await response.json();

      expect(data.previousQuestionId).toBe('prev-id');
      expect(data.nextQuestionId).toBeNull();
    });

    test('should return null for both if no other questions exist', async () => {
      (prisma.question.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // No previous question
        .mockResolvedValueOnce(null); // No next question

      const request = mockRequest({
        currentQuestionId,
        currentQuestionCreatedAt,
      });
      const response = await GET(request);
      const data = await response.json();

      expect(data.previousQuestionId).toBeNull();
      expect(data.nextQuestionId).toBeNull();
    });

     test('should handle errors gracefully when fetching prev/next IDs', async () => {
      (prisma.question.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));
      const request = mockRequest({
        currentQuestionId,
        currentQuestionCreatedAt,
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch data');
    });

    test('should not call findMany or count when fetching prev/next IDs', async () => {
      (prisma.question.findFirst as jest.Mock).mockResolvedValue(null); // Does not matter what it returns
      const request = mockRequest({
        currentQuestionId,
        currentQuestionCreatedAt,
      });
      await GET(request);
      expect(prisma.question.findMany).not.toHaveBeenCalled();
      expect(prisma.question.count).not.toHaveBeenCalled();
    });
  }); // End of Previous/Next Question ID Logic

  // Original tests continue from here, ensure they are outside the new describe block
  // but within the main describe for 'GET /api/questions'
  // The diff tool should handle placing this correctly relative to existing tests.
  // For clarity, I am assuming the existing tests were wrapped into 'Original Question Listing Logic'
  // If they were not, the structure would be slightly different, but the new describe block would still be added.

  test('Test Case 1: Default parameters', async () => {
    const mockQuestions = [{ id: '1', title: 'Test Question' }];
    const mockTotalCount = 1;

    (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
    (prisma.question.count as jest.Mock).mockResolvedValue(mockTotalCount);

    const request = mockRequest({});
    const response = await GET(request);
    const body = await response.json();

    expect(prisma.question.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { created_at: 'desc' },
      skip: 0,
      take: 10,
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({
      questions: mockQuestions,
      totalCount: mockTotalCount,
      page: 1,
      limit: 10,
    });
  });

  test('Test Case 2: Specific page', async () => {
    const mockQuestions = [{ id: '2', title: 'Test Question Page 2' }];
    const mockTotalCount = 11;

    (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
    (prisma.question.count as jest.Mock).mockResolvedValue(mockTotalCount);

    const request = mockRequest({ page: '2' });
    const response = await GET(request);
    const body = await response.json();

    expect(prisma.question.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { created_at: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({
      questions: mockQuestions,
      totalCount: mockTotalCount,
      page: 2,
      limit: 10,
    });
  });

  test('Test Case 3: With category filter and pagination', async () => {
    const mockQuestions = [{ id: '3', title: 'AI Question Page 3' }];
    const mockTotalCount = 25;

    (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
    (prisma.question.count as jest.Mock).mockResolvedValue(mockTotalCount);

    const request = mockRequest({ category: 'AI', page: '3' });
    const response = await GET(request);
    const body = await response.json();

    const expectedWhereClause = { category: 'AI' };
    expect(prisma.question.count).toHaveBeenCalledWith({ where: expectedWhereClause });
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: expectedWhereClause,
      orderBy: { created_at: 'desc' },
      skip: 20,
      take: 10,
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({
      questions: mockQuestions,
      totalCount: mockTotalCount,
      page: 3,
      limit: 10,
    });
  });

  test('Test Case 4a: Page out of bounds (page=0)', async () => {
    const mockQuestions = [{ id: '1', title: 'Test Question Page 1' }]; // Should return page 1
    const mockTotalCount = 5;

    (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
    (prisma.question.count as jest.Mock).mockResolvedValue(mockTotalCount);

    const request = mockRequest({ page: '0' });
    const response = await GET(request);
    const body = await response.json();

    expect(prisma.question.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { created_at: 'desc' },
      skip: 0, // For page=0, it defaults to page 1, so skip is 0
      take: 10,
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({
      questions: mockQuestions,
      totalCount: mockTotalCount,
      page: 1, // Page should be corrected to 1
      limit: 10,
    });
  });

  test('Test Case 4b: Page out of bounds (page too high)', async () => {
    const mockQuestions: any[] = []; // No questions for a page too high
    const mockTotalCount = 25; // Still have a total count

    (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
    (prisma.question.count as jest.Mock).mockResolvedValue(mockTotalCount);

    const request = mockRequest({ page: '100' }); // Assuming only 3 pages of data (25 items / 10 per page)
    const response = await GET(request);
    const body = await response.json();

    const expectedWhereClause = {}; // No category specified
    expect(prisma.question.count).toHaveBeenCalledWith({ where: expectedWhereClause });
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: expectedWhereClause,
      orderBy: { created_at: 'desc' },
      skip: (100 - 1) * 10, // skip will be 990
      take: 10,
    });
    expect(response.status).toBe(200);
    expect(body.questions).toEqual([]);
    expect(body.totalCount).toBe(mockTotalCount);
    expect(body.page).toBe(100); // API returns the requested page number
    expect(body.limit).toBe(10);
  });

  test('Category "all" should result in an empty where clause', async () => {
    (prisma.question.count as jest.Mock).mockResolvedValue(0);
    (prisma.question.findMany as jest.Mock).mockResolvedValue([]);

    const request = mockRequest({ category: 'all', page: '1' });
    await GET(request);

    expect(prisma.question.count).toHaveBeenCalledWith({
      where: {}, // Empty where clause
    });
     expect(prisma.question.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {}, // Empty where clause
    }));
  });
  // Ensure error handling for listing mode is also present if not already
  test('Error handling in listing mode', async () => {
    (prisma.question.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));
    const request = mockRequest({ page: '1' });
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to fetch data');
   });

}); // End of main describe 'GET /api/questions'
