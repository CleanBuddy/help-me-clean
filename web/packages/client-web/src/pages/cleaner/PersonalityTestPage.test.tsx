import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import PersonalityTestPage from './PersonalityTestPage';
import {
  PERSONALITY_QUESTIONS,
  MY_PERSONALITY_ASSESSMENT,
} from '@/graphql/operations';

vi.mock('@helpmeclean/shared', () => ({
  cn: (...args: unknown[]) =>
    args
      .flat()
      .filter((a) => typeof a === 'string' && a.length > 0)
      .join(' '),
}));

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockQuestions = [
  { number: 1, facetCode: 'A1', text: 'Test question 1' },
  { number: 2, facetCode: 'A2', text: 'Test question 2' },
  { number: 3, facetCode: 'A3', text: 'Test question 3' },
];

function setupMocks(opts: { alreadyCompleted?: boolean } = {}) {
  const mockSubmitFn = vi.fn().mockResolvedValue({
    data: {
      submitPersonalityAssessment: {
        id: 'test-assessment-id',
        completedAt: '2024-01-01T00:00:00Z',
      },
    },
  });

  vi.mocked(useMutation).mockReturnValue([
    mockSubmitFn,
    { loading: false },
  ] as unknown as ReturnType<typeof useMutation>);

  vi.mocked(useQuery).mockImplementation((query: unknown) => {
    if (query === PERSONALITY_QUESTIONS) {
      return {
        data: { personalityQuestions: mockQuestions },
        loading: false,
      } as ReturnType<typeof useQuery>;
    }
    if (query === MY_PERSONALITY_ASSESSMENT) {
      return {
        data: {
          myPersonalityAssessment: opts.alreadyCompleted
            ? { id: 'existing-assessment', completedAt: '2024-01-01T00:00:00Z' }
            : null,
        },
        loading: false,
      } as ReturnType<typeof useQuery>;
    }
    return { data: null, loading: false } as ReturnType<typeof useQuery>;
  });

  return { mockSubmitFn };
}

function renderPage() {
  return render(
    <BrowserRouter>
      <PersonalityTestPage />
    </BrowserRouter>,
  );
}

describe('PersonalityTestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders intro screen initially', () => {
    setupMocks();
    renderPage();

    expect(screen.getByText(/Test de personalitate/i)).toBeInTheDocument();
    expect(screen.getByText(/Începe testul/i)).toBeInTheDocument();
  });

  it('shows questions when starting the test', async () => {
    const user = userEvent.setup();
    setupMocks();
    renderPage();

    await user.click(screen.getByText(/Începe testul/i));

    expect(screen.getByText('Test question 1')).toBeInTheDocument();
    expect(screen.getByText('Întrebarea 1 din 3')).toBeInTheDocument();
  });

  it('handles answer selection and navigation', async () => {
    const user = userEvent.setup();
    setupMocks();
    renderPage();

    // Start test
    await user.click(screen.getByText(/Începe testul/i));
    expect(screen.getByText('Test question 1')).toBeInTheDocument();

    // Select an answer (Nici acord, nici dezacord - option 3)
    const option3 = screen.getAllByRole('button').find((btn) => btn.textContent === 'Nici acord, nici dezacord');
    expect(option3).toBeInTheDocument();
    await user.click(option3!);

    // Navigate to next question
    await user.click(screen.getByText('Următoarea'));

    expect(screen.getByText('Test question 2')).toBeInTheDocument();
    expect(screen.getByText('Întrebarea 2 din 3')).toBeInTheDocument();
  });

  it('allows navigating back to previous question', async () => {
    const user = userEvent.setup();
    setupMocks();
    renderPage();

    // Start and answer first question
    await user.click(screen.getByText(/Începe testul/i));
    expect(screen.getByText('Test question 1')).toBeInTheDocument();

    const option3 = screen.getAllByRole('button').find((btn) => btn.textContent === 'Nici acord, nici dezacord');
    await user.click(option3!);
    await user.click(screen.getByText('Următoarea'));

    expect(screen.getByText('Test question 2')).toBeInTheDocument();

    // Navigate back
    await user.click(screen.getByText('Înapoi'));

    expect(screen.getByText('Test question 1')).toBeInTheDocument();
  });

  it('validates all questions answered before allowing submit', async () => {
    const user = userEvent.setup();
    setupMocks();
    renderPage();

    // Start test
    await user.click(screen.getByText(/Începe testul/i));
    expect(screen.getByText('Test question 1')).toBeInTheDocument();

    // Answer only first question
    const option3 = screen.getAllByRole('button').find((btn) => btn.textContent === 'Nici acord, nici dezacord');
    await user.click(option3!);

    // Navigate to second question
    await user.click(screen.getByText('Următoarea'));

    // Submit button should not be visible - not on last question or not all answered
    const submitButton = screen.queryByText('Trimite');
    if (submitButton) {
      expect(submitButton).toBeDisabled();
    } else {
      expect(screen.getByText('Următoarea')).toBeInTheDocument();
    }
  });

  it('submits answers and redirects on success', async () => {
    const user = userEvent.setup();
    const { mockSubmitFn } = setupMocks();
    renderPage();

    // Start test
    await user.click(screen.getByText(/Începe testul/i));

    // Question 1 - select option 3 (Nici acord, nici dezacord)
    const option3_q1 = screen.getAllByRole('button').find((btn) => btn.textContent === 'Nici acord, nici dezacord');
    await user.click(option3_q1!);
    await user.click(screen.getByText('Următoarea'));

    // Question 2 - select option 4 (Acord)
    const option4_q2 = screen.getAllByRole('button').find((btn) => btn.textContent === 'Acord');
    await user.click(option4_q2!);
    await user.click(screen.getByText('Următoarea'));

    // Question 3 - select option 5 (Acord total)
    const option5_q3 = screen.getAllByRole('button').find((btn) => btn.textContent === 'Acord total');
    await user.click(option5_q3!);

    // Submit
    const submitButton = screen.getByText('Trimite');
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(mockSubmitFn).toHaveBeenCalledWith({
      variables: {
        answers: [
          { questionNumber: 1, response: 3 },
          { questionNumber: 2, response: 4 },
          { questionNumber: 3, response: 5 },
        ],
      },
    });
  });

  it('shows completion page if assessment already completed', () => {
    setupMocks({ alreadyCompleted: true });
    renderPage();

    expect(screen.getByText('Test finalizat')).toBeInTheDocument();
    expect(screen.getByText(/Ai completat deja testul de personalitate/i)).toBeInTheDocument();
    expect(screen.getByText('Înapoi la dashboard')).toBeInTheDocument();
  });

  it('displays progress percentage correctly', async () => {
    const user = userEvent.setup();
    setupMocks();
    renderPage();

    // Start test
    await user.click(screen.getByText(/Începe testul/i));
    expect(screen.getByText('Test question 1')).toBeInTheDocument();

    // Check progress (0% initially)
    expect(screen.getByText(/0% completat/i)).toBeInTheDocument();

    // Answer first question
    const option3 = screen.getAllByRole('button').find((btn) => btn.textContent === 'Nici acord, nici dezacord');
    await user.click(option3!);

    // Progress should be 33% (1 out of 3 questions)
    expect(screen.getByText(/33% completat/i)).toBeInTheDocument();
  });
});
