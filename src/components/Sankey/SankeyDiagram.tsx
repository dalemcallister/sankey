import React, { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { scaleOrdinal } from 'd3-scale';
import { interpolateRainbow } from 'd3-scale-chromatic';

interface SankeyProps {
  nodes: string[];
  links: {
    source: number;
    target: number;
    value: number;
  }[];
  width?: number;
  height?: number;
}

export function SankeyDiagram({ nodes, links, width = 800, height = 600 }: SankeyProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const sankeyData = {
      nodes: nodes.map(name => ({ name })),
      links: links.map(d => ({ ...d }))
    };

    const sankeyLayout = sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[1, 1], [width - 1, height - 5]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyLayout(sankeyData);

    const color = scaleOrdinal<string>()
      .domain(nodes)
      .range(nodes.map((_, i) => interpolateRainbow(i / nodes.length)));

    // Draw links with smooth animations
    const linkGroup = svg.append("g")
      .attr("class", "links")
      .style("mix-blend-mode", "multiply");

    const link = linkGroup.selectAll("path")
      .data(sankeyLinks)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => color((d.source as any).name))
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("opacity", 0.5)
      .style("transition", "opacity 0.3s, stroke-width 0.3s");

    // Add hover effects for links
    link.on("mouseover", function() {
      select(this)
        .attr("opacity", 0.8)
        .attr("stroke-width", d => Math.max(1, (d as any).width * 1.2));
    })
    .on("mouseout", function() {
      select(this)
        .attr("opacity", 0.5)
        .attr("stroke-width", d => Math.max(1, (d as any).width));
    });

    // Draw nodes with enhanced styling
    const nodeGroup = svg.append("g")
      .attr("class", "nodes");

    const node = nodeGroup.selectAll("g")
      .data(sankeyNodes)
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Add node rectangles with hover effects
    node.append("rect")
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => color(d.name))
      .attr("opacity", 0.8)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("transition", "all 0.3s")
      .on("mouseover", function(event, d) {
        select(this)
          .attr("opacity", 1)
          .attr("stroke", "#000")
          .attr("stroke-width", 1);

        // Highlight connected links
        link.attr("opacity", l => 
          l.source.name === d.name || l.target.name === d.name ? 0.8 : 0.2
        );
      })
      .on("mouseout", function() {
        select(this)
          .attr("opacity", 0.8)
          .attr("stroke", "none");

        link.attr("opacity", 0.5);
      });

    // Add node labels with enhanced styling
    node.append("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 - d.x0 + 6 : -6)
      .attr("y", d => (d.y1 - d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
      .attr("fill", "#2d3748")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.1)")
      .attr("pointer-events", "none");

    // Add value tooltips
    node.append("title")
      .text(d => `${d.name}\nValue: ${d.value}`);

  }, [nodes, links, width, height]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height} 
      className="mx-auto"
      style={{
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
        background: 'white',
        borderRadius: '8px'
      }}
    />
  );
}