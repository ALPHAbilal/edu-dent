export const testVisualization = `
// Clear existing content
d3.select("#visualization").selectAll("*").remove();

// Set dimensions - use fixed numeric values
const width = 800;
const height = 400;
const margin = {top: 20, right: 20, bottom: 40, left: 50};

// Create SVG with fixed dimensions
const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Add a simple circle to test
svg.append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", 50)
  .style("fill", "steelblue")
  .style("stroke", "navy")
  .style("stroke-width", 2);

// Add text
svg.append("text")
  .attr("x", width / 2)
  .attr("y", height / 2 + 80)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .text("D3.js is working!");

console.log("Test visualization rendered successfully!");
`;