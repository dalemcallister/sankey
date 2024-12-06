import type { SankeyLink } from '../types/sankey';

export function detectCycle(nodes: string[], links: SankeyLink[]): boolean {
  const graph: { [key: number]: number[] } = {};
  
  // Build adjacency list
  links.forEach(({ source, target }) => {
    if (!graph[source]) graph[source] = [];
    graph[source].push(target);
  });

  const visited = new Set<number>();
  const recursionStack = new Set<number>();

  function hasCycle(node: number): boolean {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) return true;
    }

    recursionStack.delete(node);
    return false;
  }

  // Check each node as a potential start of a cycle
  for (let node = 0; node < nodes.length; node++) {
    if (!visited.has(node) && hasCycle(node)) {
      return true;
    }
  }

  return false;
}