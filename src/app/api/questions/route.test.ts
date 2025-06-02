import { GET } from './route'; // Adjust the import path as necessary
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { URL } from 'url'; // Import URL

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  question: {
    findMany: jest.fn(),
    count: jest.fn(),
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
  });

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
});
