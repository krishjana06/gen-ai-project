export interface CourseNode {
  id: string;
  title: string;
  description: string;
  subject: 'CS' | 'MATH';
  catalog_number: string;
  difficulty_score: number;
  enjoyment_score: number;
  comment_count: number;
  confidence: string;
  in_degree: number;
  out_degree: number;
  centrality: number;
  prerequisites?: string[];
  unlocks?: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  directed?: boolean;
  multigraph?: boolean;
  graph?: Record<string, any>;
  nodes: CourseNode[];
  links: GraphEdge[];
}
