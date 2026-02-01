import { GraphData } from '@/types/course';

export function enhanceGraphForDisplay(data: GraphData): GraphData {
  // If no edges, create weak links for visual clustering
  if (!data.links || data.links.length === 0) {
    const weakLinks = data.nodes.flatMap((node, i) =>
      data.nodes
        .slice(i + 1)
        .filter(other => other.subject === node.subject)
        .slice(0, 3) // Limit to 3 connections per node
        .map(other => ({
          source: node.id,
          target: other.id,
        }))
    );
    return { ...data, links: weakLinks };
  }
  return data;
}

export function extractCourseCodes(text: string): string[] {
  const regex = /(CS|MATH)\s*\d{4}/g;
  const matches = text.match(regex) || [];
  return matches.map(m => m.replace(/\s+/g, ' ').trim());
}
