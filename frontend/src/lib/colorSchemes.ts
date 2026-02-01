export const theme = {
  background: {
    main: '#F7F7F7',
    panel: '#FFFFFF',
    white: '#FFFFFF',
  },
  text: {
    primary: '#222222',
    secondary: '#555555',
    muted: '#888888',
  },
  subjects: {
    CS: '#B31B1B',
    MATH: '#333333',
  },
  difficulty: {
    easy: '#4CAF50',
    medium: '#42A5F5',
    hard: '#FF9800',
    veryHard: '#F44336',
  },
  cornell: {
    red: '#B31B1B',
    redDark: '#8B1515',
    carnelian: '#D44A3C',
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
