import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuestionNavigation from '../QuestionNavigation';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    // Directly render the button/span child and pass href to an 'a' tag if button is child
    // This is a simplified mock. For buttons inside Link, we might need to check props differently.
    // For this component, the button is a direct child.
    if (React.isValidElement(children) && typeof children.type === 'function') { // Check if children is a React component (like our button)
         // This mock assumes the children of Link is a simple element like a button or span
         // and it will have its props checked directly.
         // For this specific component, we render the child and check its props or what it renders.
         // The <Link> itself would typically render an <a> tag.
         // Let's try to make the mock render the child as is, and check the href prop passed to Link.
         // We can verify the href by checking the props of the mocked Link component.
         // However, a simpler way for this case is to render an actual <a> tag.
        return <a href={href}>{children}</a>;
    }
    return <div data-testid="mock-link" data-href={href}>{children}</div>; // Fallback for other children types
  };
});


describe('QuestionNavigation Component', () => {
  const previousText = '← 前の質問へ';
  const nextText = '次の質問へ →';

  test('renders both buttons active when both IDs are provided', () => {
    render(<QuestionNavigation previousQuestionId="123" nextQuestionId="456" />);

    const prevLink = screen.getByText(previousText).closest('a');
    expect(prevLink).toBeInTheDocument();
    expect(prevLink).toHaveAttribute('href', '/question/123');
    expect(screen.getByText(previousText)).not.toHaveClass('cursor-not-allowed');
    expect(screen.getByText(previousText)).toHaveClass('bg-blue-500');


    const nextLink = screen.getByText(nextText).closest('a');
    expect(nextLink).toBeInTheDocument();
    expect(nextLink).toHaveAttribute('href', '/question/456');
    expect(screen.getByText(nextText)).not.toHaveClass('cursor-not-allowed');
    expect(screen.getByText(nextText)).toHaveClass('bg-blue-500');
  });

  test('renders previous button disabled and next button active', () => {
    render(<QuestionNavigation previousQuestionId={null} nextQuestionId="456" />);

    const prevButton = screen.getByText(previousText);
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).toHaveClass('cursor-not-allowed');
    expect(prevButton).toHaveClass('bg-gray-300');
    expect(prevButton.closest('a')).toBeNull(); // Should not be a link

    const nextLink = screen.getByText(nextText).closest('a');
    expect(nextLink).toBeInTheDocument();
    expect(nextLink).toHaveAttribute('href', '/question/456');
    expect(screen.getByText(nextText)).not.toHaveClass('cursor-not-allowed');
    expect(screen.getByText(nextText)).toHaveClass('bg-blue-500');
  });

  test('renders previous button active and next button disabled', () => {
    render(<QuestionNavigation previousQuestionId="123" nextQuestionId={null} />);

    const prevLink = screen.getByText(previousText).closest('a');
    expect(prevLink).toBeInTheDocument();
    expect(prevLink).toHaveAttribute('href', '/question/123');
    expect(screen.getByText(previousText)).not.toHaveClass('cursor-not-allowed');
    expect(screen.getByText(previousText)).toHaveClass('bg-blue-500');

    const nextButton = screen.getByText(nextText);
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveClass('cursor-not-allowed');
    expect(nextButton).toHaveClass('bg-gray-300');
    expect(nextButton.closest('a')).toBeNull(); // Should not be a link
  });

  test('renders both buttons disabled when both IDs are null', () => {
    render(<QuestionNavigation previousQuestionId={null} nextQuestionId={null} />);

    const prevButton = screen.getByText(previousText);
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).toHaveClass('cursor-not-allowed');
    expect(prevButton).toHaveClass('bg-gray-300');
    expect(prevButton.closest('a')).toBeNull();

    const nextButton = screen.getByText(nextText);
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveClass('cursor-not-allowed');
    expect(nextButton).toHaveClass('bg-gray-300');
    expect(nextButton.closest('a')).toBeNull();
  });
});
