export const pendulumTemplate = `
// Interactive Pendulum Visualization
const width = 600;
const height = 400;
const g = 9.81; // gravity (m/s²)

// Create SVG
const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height]);

// Add background
svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "#f8f9fa");

// Pendulum parameters
let length = 2; // meters
let angle = Math.PI / 6; // initial angle (30 degrees)
let angleVelocity = 0;
let angleAcceleration = 0;
let damping = 0.995; // slight damping for realism

// Scaling
const scale = 100; // pixels per meter
const originX = width / 2;
const originY = 100;

// Create pendulum group
const pendulumGroup = svg.append("g");

// Draw support
pendulumGroup.append("line")
  .attr("x1", originX - 50)
  .attr("y1", originY)
  .attr("x2", originX + 50)
  .attr("y2", originY)
  .attr("stroke", "#333")
  .attr("stroke-width", 4);

pendulumGroup.append("circle")
  .attr("cx", originX)
  .attr("cy", originY)
  .attr("r", 5)
  .attr("fill", "#333");

// Draw pendulum rod
const rod = pendulumGroup.append("line")
  .attr("x1", originX)
  .attr("y1", originY)
  .attr("stroke", "#666")
  .attr("stroke-width", 2);

// Draw pendulum bob
const bob = pendulumGroup.append("circle")
  .attr("r", 20)
  .attr("fill", "#3b82f6")
  .attr("stroke", "#1e40af")
  .attr("stroke-width", 2);

// Create trail for path visualization
const trail = pendulumGroup.append("path")
  .attr("fill", "none")
  .attr("stroke", "#3b82f6")
  .attr("stroke-width", 1)
  .attr("opacity", 0.3);

const trailPoints = [];
const maxTrailPoints = 200;

// Add controls
const controls = d3.select("#visualization")
  .append("div")
  .style("margin-top", "20px");

// Length slider
controls.append("label")
  .text("Length (m): ")
  .style("margin-right", "10px");

const lengthSlider = controls.append("input")
  .attr("type", "range")
  .attr("min", 0.5)
  .attr("max", 3)
  .attr("step", 0.1)
  .attr("value", length)
  .style("width", "200px")
  .on("input", function() {
    length = +this.value;
    lengthValue.text(length.toFixed(1) + " m");
  });

const lengthValue = controls.append("span")
  .text(length.toFixed(1) + " m")
  .style("margin-left", "10px")
  .style("margin-right", "20px");

// Damping slider
controls.append("label")
  .text("Damping: ")
  .style("margin-right", "10px");

const dampingSlider = controls.append("input")
  .attr("type", "range")
  .attr("min", 0.9)
  .attr("max", 1)
  .attr("step", 0.001)
  .attr("value", damping)
  .style("width", "200px")
  .on("input", function() {
    damping = +this.value;
    dampingValue.text(damping.toFixed(3));
  });

const dampingValue = controls.append("span")
  .text(damping.toFixed(3))
  .style("margin-left", "10px");

// Reset button
controls.append("button")
  .text("Reset")
  .style("margin-left", "20px")
  .style("padding", "5px 15px")
  .style("background", "#3b82f6")
  .style("color", "white")
  .style("border", "none")
  .style("border-radius", "4px")
  .style("cursor", "pointer")
  .on("click", () => {
    angle = Math.PI / 6;
    angleVelocity = 0;
    trailPoints.length = 0;
  });

// Info display
const info = d3.select("#visualization")
  .append("div")
  .style("margin-top", "20px")
  .style("font-family", "monospace")
  .style("font-size", "14px");

// Update pendulum position
function updatePendulum() {
  const x = originX + length * scale * Math.sin(angle);
  const y = originY + length * scale * Math.cos(angle);
  
  rod.attr("x2", x).attr("y2", y);
  bob.attr("cx", x).attr("cy", y);
  
  // Add to trail
  trailPoints.push([x, y]);
  if (trailPoints.length > maxTrailPoints) {
    trailPoints.shift();
  }
  
  // Update trail
  if (trailPoints.length > 1) {
    const line = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCardinal);
    trail.attr("d", line(trailPoints));
  }
}

// Physics simulation
function simulate() {
  // Calculate angular acceleration (small angle approximation: sin(θ) ≈ θ)
  // For accuracy, we use the full equation: α = -(g/L) * sin(θ)
  angleAcceleration = -(g / length) * Math.sin(angle);
  
  // Update velocity and position
  angleVelocity += angleAcceleration * 0.02; // dt = 0.02s
  angleVelocity *= damping; // apply damping
  angle += angleVelocity * 0.02;
  
  // Update visualization
  updatePendulum();
  
  // Update info
  const period = 2 * Math.PI * Math.sqrt(length / g);
  const kineticEnergy = 0.5 * length * length * angleVelocity * angleVelocity;
  const potentialEnergy = length * g * (1 - Math.cos(angle));
  const totalEnergy = kineticEnergy + potentialEnergy;
  
  info.html(
    \`Angle: \${(angle * 180 / Math.PI).toFixed(1)}°<br>
    Angular velocity: \${angleVelocity.toFixed(3)} rad/s<br>
    Period: \${period.toFixed(2)} s<br>
    Kinetic Energy: \${kineticEnergy.toFixed(3)} J/kg<br>
    Potential Energy: \${potentialEnergy.toFixed(3)} J/kg<br>
    Total Energy: \${totalEnergy.toFixed(3)} J/kg\`
  );
  
  requestAnimationFrame(simulate);
}

// Make pendulum draggable
let isDragging = false;

bob.style("cursor", "grab")
  .on("mousedown", () => {
    isDragging = true;
    bob.style("cursor", "grabbing");
  });

svg.on("mousemove", (event) => {
  if (isDragging) {
    const [mouseX, mouseY] = d3.pointer(event);
    const dx = mouseX - originX;
    const dy = mouseY - originY;
    angle = Math.atan2(dx, dy);
    angleVelocity = 0;
    updatePendulum();
  }
});

svg.on("mouseup", () => {
  isDragging = false;
  bob.style("cursor", "grab");
});

// Start simulation
updatePendulum();
simulate();
`;