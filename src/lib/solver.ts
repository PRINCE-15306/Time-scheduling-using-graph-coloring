export interface Section {
  id: string;
  name: string;
  subject_id: string;
  teacher_id: string;
  group_id: string;
  room_id: string;
}

export interface ConflictGraph {
  nodes: string[];
  adj: Record<string, Set<string>>;
}

export interface SolveResult {
  colorOf: Record<string, number>;
  colorsCount: number;
  graph: ConflictGraph;
}

export function buildConflictGraph(sections: Section[]): ConflictGraph {
  const nodes = sections.map((s) => s.id);
  const adj: Record<string, Set<string>> = {};
  
  nodes.forEach((n) => {
    adj[n] = new Set();
  });

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const a = sections[i];
      const b = sections[j];
      
      // Sections conflict if they share teacher, room, or student group
      if (
        a.teacher_id === b.teacher_id ||
        a.room_id === b.room_id ||
        a.group_id === b.group_id
      ) {
        adj[a.id].add(b.id);
        adj[b.id].add(a.id);
      }
    }
  }

  return { nodes, adj };
}

export function solveGreedy(sections: Section[]): SolveResult {
  const graph = buildConflictGraph(sections);
  
  // Sort by degree (Largest Degree First heuristic)
  const deg = graph.nodes.map((n) => ({
    id: n,
    d: graph.adj[n].size,
  }));
  deg.sort((a, b) => b.d - a.d);

  const colorOf: Record<string, number> = {};
  
  for (const nd of deg) {
    const used = new Set<number>();
    
    // Check colors used by neighbors
    for (const nb of graph.adj[nd.id]) {
      if (colorOf[nb] !== undefined) {
        used.add(colorOf[nb]);
      }
    }

    // Find first available color
    let c = 0;
    while (used.has(c)) {
      c++;
    }
    colorOf[nd.id] = c;
  }

  const colorsCount = Math.max(...Object.values(colorOf)) + 1;

  return { colorOf, colorsCount, graph };
}

export function improveColoring(
  colorOf: Record<string, number>,
  graph: ConflictGraph,
  iterations: number = 200
): { colorOf: Record<string, number>; colorsCount: number } {
  const nodes = Object.keys(colorOf);
  const best = { ...colorOf };
  let bestMax = Math.max(...Object.values(best));

  for (let it = 0; it < iterations; it++) {
    const n = nodes[Math.floor(Math.random() * nodes.length)];
    const forbidden = new Set<number>();

    // Get forbidden colors from neighbors
    for (const nb of graph.adj[n]) {
      forbidden.add(best[nb]);
    }

    // Try to find a lower color
    for (let c = 0; c < best[n]; c++) {
      if (!forbidden.has(c)) {
        best[n] = c;
        const curMax = Math.max(...Object.values(best));
        if (curMax < bestMax) {
          bestMax = curMax;
        }
        break;
      }
    }
  }

  return { colorOf: best, colorsCount: bestMax + 1 };
}
