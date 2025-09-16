import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SimilarityAnalysis, HierarchicalClustering, PerformanceOptimizer } from '../analytics';
import { CardSortResult, ClusterNode } from '../types';

interface DendrogramProps {
  results: CardSortResult[];
  width?: number;
  height?: number;
  responsive?: boolean;
}

const Dendrogram: React.FC<DendrogramProps> = ({ 
  results, 
  width = 800, 
  height = 600,
  responsive = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Handle responsive sizing
  useEffect(() => {
    if (!responsive) return;
    
    const handleResize = PerformanceOptimizer.throttle(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = Math.min(containerWidth * 0.75, 600);
        const mobile = window.innerWidth < 768;
        
        setDimensions({ 
          width: Math.max(containerWidth, 400), 
          height: Math.max(containerHeight, 300) 
        });
        setIsMobile(mobile);
        setOrientation(mobile ? 'vertical' : 'horizontal');
      }
    }, 250);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [responsive]);

  useEffect(() => {
    if (!svgRef.current || results.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render
    
    const currentWidth = responsive ? dimensions.width : width;
    const currentHeight = responsive ? dimensions.height : height;

    // Get card names for clustering
    const cardNames: string[] = [];
    if (results.length > 0) {
      results[0].cardSortResults.forEach(category => {
        category.cards.forEach(card => {
          if (!cardNames.includes(card.text)) {
            cardNames.push(card.text);
          }
        });
      });
    }

    if (cardNames.length === 0) return;

    // Calculate similarity matrix and perform clustering
    const similarityMatrix = SimilarityAnalysis.createSimilarityMatrix(results);
    const clusterRoot = HierarchicalClustering.cluster(similarityMatrix, cardNames);

    // Set up dimensions with sufficient space for labels
    const margin = isMobile 
      ? { top: 60, right: 100, bottom: 60, left: 100 }
      : { top: 80, right: 150, bottom: 80, left: 150 };

    const innerWidth = currentWidth - margin.left - margin.right;
    const innerHeight = currentHeight - margin.top - margin.bottom;

    // Create D3 hierarchy from cluster data
    const root = d3.hierarchy(clusterRoot);
    
    // Create tree layout
    const treeLayout = orientation === 'horizontal'
      ? d3.tree<ClusterNode>().size([innerHeight, innerWidth])
      : d3.tree<ClusterNode>().size([innerWidth, innerHeight]);
    
    treeLayout(root);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Color scale based on cluster distance
    const maxDistance = Math.max(...root.descendants().map(d => d.data.distance));
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, maxDistance]);

    // Draw links (branches)
    const linkGenerator = orientation === 'horizontal'
      ? d3.linkHorizontal<any, d3.HierarchyPointNode<ClusterNode>>()
          .x(d => d.y)
          .y(d => d.x)
      : d3.linkVertical<any, d3.HierarchyPointNode<ClusterNode>>()
          .x(d => d.x)
          .y(d => d.y);

    g.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .style('fill', 'none')
      .style('stroke', d => colorScale(d.target.data.distance))
      .style('stroke-width', d => {
        const baseWidth = isMobile ? 1.5 : 2;
        return baseWidth * (1 + (d.target.data.size || 1) * 0.1);
      })
      .style('opacity', 0.8);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => 
        orientation === 'horizontal' 
          ? `translate(${d.y}, ${d.x})`
          : `translate(${d.x}, ${d.y})`
      );

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', d => {
        const baseRadius = isMobile ? 3 : 4;
        return d.children ? baseRadius + 1 : baseRadius;
      })
      .style('fill', d => d.children ? colorScale(d.data.distance) : '#4f46e5')
      .style('stroke', '#fff')
      .style('stroke-width', 1);

    // Add labels for leaf nodes (actual cards) with bounds checking
    nodes.filter(d => !d.children)
      .append('text')
      .attr('dx', orientation === 'horizontal' ? 8 : 0)
      .attr('dy', orientation === 'horizontal' ? 4 : -8)
      .style('text-anchor', orientation === 'horizontal' ? 'start' : 'middle')
      .style('font-size', isMobile ? '10px' : '12px')
      .style('font-weight', '500')
      .style('fill', '#1f2937')
      .text(d => {
        const maxLength = isMobile ? 8 : 12; // Reduced max length to prevent overflow
        const text = d.data.name;
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      })
      .each(function(d) {
        // Ensure text doesn't overflow container bounds
        const textElement = d3.select(this);
        const bbox = this.getBBox();
        
        if (orientation === 'horizontal') {
          // Check if text extends beyond right margin
          const textRightEdge = (d.y || 0) + bbox.width + 8;
          if (textRightEdge > innerWidth) {
            // Truncate further if needed
            const availableWidth = innerWidth - (d.y || 0) - 8;
            const charWidth = bbox.width / d.data.name.length;
            const maxChars = Math.floor(availableWidth / charWidth) - 3;
            if (maxChars > 0) {
              textElement.text(d.data.name.substring(0, maxChars) + '...');
            }
          }
        } else {
          // Check if text extends beyond bottom margin  
          const textBottomEdge = (d.y || 0) + bbox.height;
          if (textBottomEdge > innerHeight + 20) {
            // Move text up if it's going beyond bounds
            textElement.attr('dy', -15);
          }
        }
      });

    // Add cluster distance labels for internal nodes
    nodes.filter(d => Boolean(d.children) && d.data.distance > 0)
      .append('text')
      .attr('dx', orientation === 'horizontal' ? -8 : 0)
      .attr('dy', orientation === 'horizontal' ? -8 : 15)
      .style('text-anchor', 'middle')
      .style('font-size', isMobile ? '8px' : '10px')
      .style('fill', '#6b7280')
      .text(d => d.data.distance.toFixed(2));

    // Add title
    svg.append('text')
      .attr('x', currentWidth / 2)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', isMobile ? '14px' : '16px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text('Card Similarity Dendrogram');

    // Add legend with proper bounds
    const legendWidth = isMobile ? 120 : 150;
    const legendHeight = isMobile ? 10 : 15;
    const legendX = Math.max(20, currentWidth - legendWidth - 30); // Ensure it doesn't go beyond left edge
    const legendY = 40;

    const legendScale = d3.scaleLinear()
      .domain([0, maxDistance])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(3)
      .tickFormat(d3.format('.2f'));

    const legend = svg.append('g')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Create gradient for legend
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'dendrogram-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    gradient.selectAll('stop')
      .data(d3.range(0, 1.1, 0.1))
      .enter().append('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => colorScale(d * maxDistance));

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#dendrogram-gradient)');

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis);

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .style('text-anchor', 'middle')
      .style('font-size', isMobile ? '9px' : '11px')
      .style('fill', '#4b5563')
      .text(isMobile ? 'Dist.' : 'Distance'); // Shorter text for mobile

  }, [results, dimensions.width, dimensions.height, isMobile, orientation]);

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border">
        <p className="text-gray-500">No card sorting data available for dendrogram analysis</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white p-2 sm:p-4 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Hierarchical Clustering</h3>
        {!isMobile && (
          <div className="flex space-x-2">
            <button
              onClick={() => setOrientation('horizontal')}
              className={`px-3 py-1 text-xs rounded ${
                orientation === 'horizontal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Horizontal
            </button>
            <button
              onClick={() => setOrientation('vertical')}
              className={`px-3 py-1 text-xs rounded ${
                orientation === 'vertical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vertical
            </button>
          </div>
        )}
      </div>
      
      <div className="overflow-hidden">
        <svg
          ref={svgRef}
          width={responsive ? dimensions.width : width}
          height={responsive ? dimensions.height : height}
          className="w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
          viewBox={`0 0 ${responsive ? dimensions.width : width} ${responsive ? dimensions.height : height}`}
        />
      </div>
      
      <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600">
        <p className="mb-1">
          <strong>How to read:</strong> Cards that are frequently grouped together appear closer in the tree. 
          Branch colors indicate clustering distance.
        </p>
        <p>
          <strong>Participants:</strong> {results.length} | 
          <strong> Clustering method:</strong> Hierarchical clustering with average linkage
        </p>
        {isMobile && (
          <p className="text-xs text-blue-600 mt-1">
            <strong>Mobile view:</strong> Some labels may be abbreviated for better visibility
          </p>
        )}
      </div>
    </div>
  );
};

export default Dendrogram;