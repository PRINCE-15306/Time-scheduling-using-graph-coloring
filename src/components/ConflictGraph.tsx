import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Network, AlertCircle } from 'lucide-react';

interface ConflictGraphProps {
  sections: any[];
  solveResult: any;
}

export default function ConflictGraph({ sections, solveResult }: ConflictGraphProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    if (!sections || sections.length === 0) {
      svg
        .append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('fill', 'hsl(var(--muted-foreground))')
        .attr('font-size', '14px')
        .text('No sections created yet');
      return;
    }

    const nodes = sections.map((s) => ({ id: s.id, name: s.name }));
    const links: Array<{ source: string; target: string }> = [];

    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const a = sections[i];
        const b = sections[j];
        if (
          a.teacherId === b.teacherId ||
          a.roomId === b.roomId ||
          a.groupId === b.groupId
        ) {
          links.push({ source: a.id, target: b.id });
        }
      }
    }

    const width = ref.current.clientWidth || 800;
    const height = 360;

    // Color scale - using our design system colors
    const colorScale = d3.scaleOrdinal([
      'hsl(237, 70%, 55%)',   // primary
      'hsl(270, 60%, 65%)',   // secondary
      'hsl(150, 60%, 50%)',   // success
      'hsl(30, 90%, 60%)',    // orange
      'hsl(340, 70%, 60%)',   // pink
      'hsl(190, 70%, 50%)',   // cyan
      'hsl(45, 90%, 55%)',    // yellow
      'hsl(280, 60%, 55%)',   // purple
    ]);

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Links
    const link = svg
      .append('g')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);

    // Nodes
    const node = svg.append('g').selectAll('g').data(nodes).join('g');

    node
      .append('circle')
      .attr('r', 18)
      .attr('fill', (d) =>
        solveResult ? colorScale(solveResult.colorOf[d.id] || 0) : 'hsl(var(--muted))'
      )
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).transition().duration(200).attr('r', 22);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(200).attr('r', 18);
      });

    node
      .append('text')
      .text((d) => d.name)
      .attr('x', 24)
      .attr('y', 5)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', 'hsl(var(--foreground))');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [sections, solveResult]);

  const conflictCount = sections.length > 0 ? (() => {
    let count = 0;
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const a = sections[i];
        const b = sections[j];
        if (
          a.teacherId === b.teacherId ||
          a.roomId === b.roomId ||
          a.groupId === b.groupId
        ) {
          count++;
        }
      }
    }
    return count;
  })() : 0;

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Conflict Graph</h3>
            <p className="text-xs text-muted-foreground">
              Visualizing scheduling conflicts
            </p>
          </div>
        </div>
        {conflictCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 text-accent">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{conflictCount} conflicts</span>
          </div>
        )}
      </div>

      <div className="relative bg-muted/20 rounded-lg overflow-hidden">
        <svg ref={ref} style={{ width: '100%', height: 360 }} />
      </div>

      {solveResult && (
        <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm font-medium text-success flex items-center gap-2">
            ✓ Schedule optimized with {solveResult.colorsCount} time slots
          </p>
        </div>
      )}
    </div>
  );
}
