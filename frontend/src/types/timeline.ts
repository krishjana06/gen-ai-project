export interface TimelineCourse {
  code: string;
  title: string;
  reason: string;
}

export interface TimelineSemester {
  name: string;
  courses: TimelineCourse[];
}

export interface TimelinePath {
  title: string;
  description: string;
  target_career: string;
  semesters: TimelineSemester[];
}

export interface TimelineAnalysis {
  career_field: string;
  key_skills_needed: string[];
  current_level: string;
}

export interface TimelineData {
  analysis: TimelineAnalysis;
  paths: {
    theorist: TimelinePath;
    engineer: TimelinePath;
    balanced: TimelinePath;
  };
}

export type PathType = 'theorist' | 'engineer' | 'balanced';
