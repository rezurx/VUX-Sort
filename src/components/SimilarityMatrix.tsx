import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SimilarityAnalysis, PerformanceOptimizer } from '../analytics';
import { CardSortResult } from '../types';

interface SimilarityMatrixProps {
  results: CardSortResult[];
  width?: number;
  height?: number;
  responsive?: boolean;
}

const SimilarityMatrix: React.FC<SimilarityMatrixProps> = ({ 
  results, 
  width = 600, 
  height = 600,
  responsive = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sizing
  useEffect(() => {
    if (!responsive) return;
    
    const handleResize = PerformanceOptimizer.throttle(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = Math.min(containerWidth, 700);
        const mobile = window.innerWidth < 768;
        
        setDimensions({ 
          width: Math.max(containerWidth, 300), 
          height: Math.max(containerHeight, 300) 
        });
        setIsMobile(mobile);
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

    // Get card names for labels
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

    // Calculate similarity matrix
    const similarityMatrix = SimilarityAnalysis.createSimilarityMatrix(results);
    const n = cardNames.length;

    // Set up dimensions with better spacing
    const margin = isMobile 
      ? { top: 100, right: 20, bottom: 100, left: 120 }
      : { top: 120, right: 30, bottom: 30, left: 150 };
    const cellSize = Math.min(
      (currentWidth - margin.left - margin.right) / n, 
      (currentHeight - margin.top - margin.bottom) / n,
      isMobile ? 30 : 40 // Better minimum cell size
    );

    // Enhanced color scale with better contrast
    const colorScale = d3.scaleSequential()
      .domain([0, 1])
      .interpolator(d3.interpolateRgb('#f8fafc', '#1e40af')); // Light gray to deep blue

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create cells
    const rows = g.selectAll('.row')
      .data(similarityMatrix)
      .enter().append('g')
      .attr('class', 'row')
      .attr('transform', (_d, i) => `translate(0, ${i * cellSize})`);

    rows.selectAll('.cell')
      .data((_d, i) => _d.map((value, j) => ({ value, row: i, col: j })))
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', d => d.col * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .style('fill', d => colorScale(d.value))
      .style('stroke', '#ffffff')
      .style('stroke-width', 2)
      .style('rx', 2)
      .style('ry', 2); // Rounded corners for cells

    // Add value labels with better contrast logic
    if (cellSize > 25) {
      rows.selectAll('.cell-text')
        .data((_d, i) => _d.map((value, j) => ({ value, row: i, col: j })))
        .enter().append('text')
        .attr('class', 'cell-text')
        .attr('x', d => d.col * cellSize + cellSize / 2)
        .attr('y', cellSize / 2)
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .style('fill', d => d.value > 0.6 ? '#ffffff' : '#1f2937')
        .style('font-size', `${Math.min(cellSize / 3.5, isMobile ? 9 : 11)}px`)
        .style('font-weight', '600')
        .style('text-shadow', d => d.value > 0.6 ? '1px 1px 2px rgba(0,0,0,0.3)' : '1px 1px 2px rgba(255,255,255,0.8)')
        .text(d => d.value.toFixed(2));
    }

    // Add row labels with better positioning and styling
    g.selectAll('.row-label')
      .data(cardNames)
      .enter().append('text')
      .attr('class', 'row-label')
      .attr('x', -15)
      .attr('y', (_d, i) => i * cellSize + cellSize / 2)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .style('font-size', `${Math.min(cellSize / 2.5, isMobile ? 11 : 13)}px`)
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text(d => {
        const maxLength = isMobile ? 12 : 18;
        return d.length > maxLength ? d.substring(0, maxLength) + '...' : d;
      });

    // Add column labels with improved rotation and positioning
    g.selectAll('.col-label')
      .data(cardNames)
      .enter().append('text')
      .attr('class', 'col-label')
      .attr('x', (_d, i) => i * cellSize + cellSize / 2)
      .attr('y', -15)
      .attr('dy', '.35em')
      .style('text-anchor', 'start') // Changed from middle to start for better rotation
      .style('font-size', `${Math.min(cellSize / 2.5, isMobile ? 11 : 13)}px`)
      .style('font-weight', '600')
      .style('fill', '#374151')
      .attr('transform', (_d, i) => `rotate(-45, ${i * cellSize + cellSize / 2}, -15)`)
      .text(d => {
        const maxLength = isMobile ? 12 : 18;
        return d.length > maxLength ? d.substring(0, maxLength) + '...' : d;
      });

    // Add title with responsive sizing
    svg.append('text')
      .attr('x', currentWidth / 2)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', isMobile ? '16px' : '18px')
      .style('font-weight', 'bold')
      .text('Card Similarity Matrix');

    // Add legend with proper bounds checking
    const legendWidth = isMobile ? 160 : 200; // Reduced width to fit better
    const legendHeight = isMobile ? 20 : 25;
    const legendX = Math.max(20, currentWidth - legendWidth - (isMobile ? 15 : 25)); // Ensure it doesn't overflow left
    const legendY = isMobile ? currentHeight - 80 : 50;

    const legendScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));

    const legend = svg.append('g')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Create gradient for legend
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    gradient.selectAll('stop')
      .data(d3.range(0, 1.1, 0.1))
      .enter().append('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => colorScale(d));

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis);

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -8)
      .style('text-anchor', 'middle')
      .style('font-size', isMobile ? '10px' : '12px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text(isMobile ? 'Similarity (0-1)' : 'Similarity Score (0 = Never, 1 = Always)'); // Shorter text for mobile

  }, [results, dimensions.width, dimensions.height, isMobile]);

  // Get card names for the info panel
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

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border">
        <p className="text-gray-500">No card sorting data available for similarity analysis</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white p-2 sm:p-4 rounded-lg shadow border">
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
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-xs sm:text-sm text-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="font-semibold text-gray-900 mb-1">How to read:</p>
            <p>Darker blue indicates higher similarity. Numbers show the percentage of participants who grouped these cards together.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Study data:</p>
            <p><strong>{results.length}</strong> participants • <strong>{cardNames.length}</strong> cards analyzed</p>
          </div>
        </div>
        {isMobile && <p className="text-xs text-blue-600 mt-2 border-t border-gray-200 pt-2"><strong>Mobile view:</strong> Labels may be abbreviated. Tap and zoom for better visibility.</p>}
      </div>
    </div>
  );
};

export default SimilarityMatrix;