export const theme = {
  background: {
    main: '#0A1929',
    panel: 'rgba(30, 58, 95, 0.7)',
    white: '#FFFFFF',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B2BAC2',
    muted: '#6B7A90',
  },
  subjects: {
    CS: '#1976D2',
    MATH: '#00ACC1',
  },
  difficulty: {
    easy: '#4CAF50',
    medium: '#42A5F5',
    hard: '#FF9800',
    veryHard: '#F44336',
  },
};

export function getSubjectColor(subject: 'CS' | 'MATH'): string {
  return theme.subjects[subject];
}

export function getDifficultyColor(score: number): string {
  if (score < 4) return theme.difficulty.easy;
  if (score < 7) return theme.difficulty.medium;
  if (score < 8.5) return theme.difficulty.hard;
  return theme.difficulty.veryHard;
}
