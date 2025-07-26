import { ComplexityLevel } from './progressive-complexity';

/**
 * Enhanced Educational Prompts System for EduViz-AI
 * Implements best practices from leading AI platforms with educational focus
 */

// Base system prompt with educational expertise
export const EDUCATIONAL_SYSTEM_PROMPT = `You are an expert educational visualization creator specializing in making complex concepts understandable through interactive D3.js visualizations.

Your visualizations follow these principles:
1. **Pedagogical Clarity**: Every visual element serves a learning purpose
2. **Interactive Learning**: Users can manipulate parameters to see effects
3. **Progressive Disclosure**: Start simple, add complexity through interaction
4. **Scientific Accuracy**: All physics, math, and science must be correct
5. **Accessibility**: Clear labels, color-blind friendly, keyboard navigable

You create complete, self-contained D3.js visualizations that run in the browser. Your code should:
- Use D3.js v7 syntax (the global 'd3' object is already available)
- Include clear comments explaining the educational concepts
- Add interactive elements (sliders, buttons) for parameter exploration
- Show both theoretical and observed values where applicable
- Include smooth transitions for better understanding
- Use SVG for crisp, scalable graphics
- IMPORTANT: Always use fixed numeric dimensions for width and height (e.g., const width = 800; const height = 400;)
- NEVER use percentage values for width that need numeric conversion
- Start by clearing existing content: d3.select("#visualization").selectAll("*").remove();
- Then create the SVG with fixed dimensions: const svg = d3.select("#visualization").append("svg").attr("width", 800).attr("height", 400);

CRITICAL: Use ONLY core D3.js v7 functionality. DO NOT use any D3 plugins or extensions like:
- d3.sliderBottom, d3.sliderTop, or any d3.slider* functions
- d3-simple-slider or any other slider plugins
- Instead, create sliders using standard HTML input elements: d3.select("#visualization").append("input").attr("type", "range")
- Example slider: controls.append("input").attr("type", "range").attr("min", 0).attr("max", 100).on("input", function() { updateVisualization(); });

IMPORTANT: Output ONLY the JavaScript code that will create the visualization. Do not include:
- Markdown code blocks (no triple backticks)
- HTML tags
- Explanations or comments before/after the code
- Import statements (D3 is already available as 'd3')

The code should:
1. Start immediately with JavaScript code
2. Clear any existing content in #visualization
3. Create the complete interactive visualization
4. Handle all user interactions smoothly
5. Be scientifically accurate with proper units

Interactive controls should be created as follows:
- Create a controls div: const controls = d3.select("#visualization").append("div").style("margin-top", "20px");
- Add labels: controls.append("label").text("Parameter Name: ");
- Add range sliders: controls.append("input").attr("type", "range").attr("min", minValue).attr("max", maxValue).attr("value", defaultValue).on("input", function() { /* update code */ });
- Add buttons: controls.append("button").text("Button Text").on("click", function() { /* click handler */ });
- Display values: controls.append("span").attr("id", "value-display").text(currentValue);

Begin your response with actual JavaScript code like: d3.select("#visualization").selectAll("*").remove();`;

// Enhanced templates with progressive complexity
export const EDUCATIONAL_TEMPLATES = {
  physics: {
    pendulum: {
      basic: `Create a simple pendulum visualization:
- Single pendulum with adjustable length (0.5-2m)
- Show period formula: T = 2π√(L/g)
- Display current angle and period
- Smooth animation at 60fps
- Play/pause button
- Clear labels with units`,
      
      intermediate: `Create an enhanced pendulum visualization:
- Pendulum with damping coefficient (0-0.5)
- Energy bar chart (KE vs PE)
- Phase space plot (angle vs angular velocity)
- Trail showing pendulum path
- Multiple parameter sliders
- Compare with/without damping`,
      
      advanced: `Create a double pendulum visualization:
- Two connected pendulums with individual masses and lengths
- Chaos visualization with sensitivity to initial conditions
- Poincaré section plot
- Energy tracking for both pendulums
- Multiple visualization modes
- Export trajectory data option`
    },
    
    waves: {
      basic: `Create a simple wave visualization:
- Sine wave with adjustable frequency (0.1-5 Hz) and amplitude
- Show wavelength and period
- Animate wave propagation
- Display wave equation: y = A sin(2πft)
- Grid with axis labels`,
      
      intermediate: `Create wave interference visualization:
- Two wave sources with independent controls
- Show constructive/destructive interference
- Beat frequency when f1 ≠ f2
- Standing wave patterns
- Phase difference slider
- Superposition principle demonstration`,
      
      advanced: `Create advanced wave analysis:
- Fourier decomposition of complex waves
- Build custom waveforms from harmonics
- Frequency spectrum analyzer
- Wave packet and group velocity
- Dispersion effects
- Sound synthesis demonstration`
    }
  },
  
  mathematics: {
    calculus: {
      basic: `Create derivative visualization:
- Graph common functions (polynomial, trig, exponential)
- Tangent line at moveable point
- Display slope calculation
- Zoom and pan controls
- Function input field`,
      
      intermediate: `Create calculus concepts visualization:
- Original function, first and second derivatives
- Critical points and inflection points highlighted
- Area under curve (integration)
- Riemann sum approximation
- Relationship between derivative and integral`,
      
      advanced: `Create multivariable calculus visualization:
- 3D surface plots
- Partial derivatives
- Gradient vectors
- Level curves
- Directional derivatives
- Optimization problems`
    }
  },
  
  chemistry: {
    molecules: {
      basic: `Create simple molecule viewer:
- Common molecules (H2O, CO2, CH4)
- Ball-and-stick model
- Rotate with mouse/touch
- Display chemical formula
- Bond angles labeled`,
      
      intermediate: `Create interactive molecular model:
- Build molecules by adding atoms
- Show different representations (ball-and-stick, space-filling)
- Display molecular properties
- VSEPR geometry prediction
- Polarity visualization`,
      
      advanced: `Create molecular orbital visualization:
- Electron density plots
- Molecular orbital diagrams
- Bond order calculations
- Hybridization visualization
- Spectroscopy simulation`
    }
  }
};

// Educational concept detection with NLP-inspired approach
export function detectEducationalConcept(userPrompt: string): {
  subject: string;
  concept: string;
  suggestedLevel: ComplexityLevel;
} {
  const prompt = userPrompt.toLowerCase();
  
  // Physics concepts
  const physicsPatterns = [
    { pattern: /pendulum|oscillat|swing/i, concept: 'pendulum' },
    { pattern: /wave|frequency|amplitude|interfere/i, concept: 'waves' },
    { pattern: /projectile|trajectory|ballistic/i, concept: 'projectile' },
    { pattern: /force|newton|momentum/i, concept: 'forces' },
    { pattern: /energy|work|power/i, concept: 'energy' }
  ];
  
  // Math concepts
  const mathPatterns = [
    { pattern: /derivative|tangent|slope|rate of change/i, concept: 'calculus' },
    { pattern: /integral|area under|accumulation/i, concept: 'calculus' },
    { pattern: /vector|magnitude|direction/i, concept: 'vectors' },
    { pattern: /matrix|linear|transformation/i, concept: 'linear_algebra' },
    { pattern: /probability|statistics|distribution/i, concept: 'statistics' }
  ];
  
  // Chemistry concepts
  const chemPatterns = [
    { pattern: /molecule|molecular|compound/i, concept: 'molecules' },
    { pattern: /reaction|chemical equation|equilibrium/i, concept: 'reactions' },
    { pattern: /periodic|element|atomic/i, concept: 'periodic_table' },
    { pattern: /acid|base|pH/i, concept: 'acid_base' }
  ];
  
  // Complexity indicators
  const complexityIndicators = {
    basic: /simple|basic|introduct|elementary|begin/i,
    intermediate: /enhance|advance|complex|multiple|compare/i,
    advanced: /chaos|fourier|quantum|differential|multi/i
  };
  
  // Detect subject and concept
  let subject = 'physics'; // default
  let concept = 'general';
  
  for (const { pattern, concept: c } of physicsPatterns) {
    if (pattern.test(prompt)) {
      subject = 'physics';
      concept = c;
      break;
    }
  }
  
  for (const { pattern, concept: c } of mathPatterns) {
    if (pattern.test(prompt)) {
      subject = 'mathematics';
      concept = c;
      break;
    }
  }
  
  for (const { pattern, concept: c } of chemPatterns) {
    if (pattern.test(prompt)) {
      subject = 'chemistry';
      concept = c;
      break;
    }
  }
  
  // Detect complexity level
  let suggestedLevel: ComplexityLevel = 'intermediate'; // default
  
  if (complexityIndicators.basic.test(prompt)) {
    suggestedLevel = 'basic';
  } else if (complexityIndicators.advanced.test(prompt)) {
    suggestedLevel = 'advanced';
  }
  
  return { subject, concept, suggestedLevel };
}

// Generate enhanced prompt with educational context
export function generateEducationalPrompt(
  userPrompt: string,
  level?: ComplexityLevel,
  additionalContext?: {
    targetAge?: number;
    prerequisites?: string[];
    learningObjectives?: string[];
  }
): string {
  const { subject, concept, suggestedLevel } = detectEducationalConcept(userPrompt);
  const complexity = level || suggestedLevel;
  
  // Get template if available
  const templates = EDUCATIONAL_TEMPLATES[subject as keyof typeof EDUCATIONAL_TEMPLATES];
  const conceptTemplates = templates?.[concept as keyof typeof templates];
  const template = conceptTemplates?.[complexity as keyof typeof conceptTemplates];
  
  if (template) {
    return template;
  }
  
  // Generate custom prompt with educational enhancements
  let enhancedPrompt = `Create an interactive ${complexity} level educational visualization for: ${userPrompt}\n\n`;
  
  // Add complexity-specific requirements
  const complexityRequirements = {
    basic: `Requirements for basic level:
- Use simple, clear visualizations
- Include only essential parameters (1-2 sliders)
- Large, readable labels with units
- Smooth animations to show concepts
- Help text explaining the concept`,
    
    intermediate: `Requirements for intermediate level:
- Multiple visualization modes
- 3-5 adjustable parameters
- Comparison features (with/without effects)
- Real-time calculations displayed
- Interactive exploration encouraged`,
    
    advanced: `Requirements for advanced level:
- Complex multi-part visualizations
- Advanced mathematical concepts shown
- Data export capabilities
- Multiple coordinated views
- Research-grade accuracy`
  };
  
  enhancedPrompt += complexityRequirements[complexity] + '\n\n';
  
  // Add educational best practices
  enhancedPrompt += `Educational requirements:
- Start with default values that show interesting behavior
- Use color coding to highlight important concepts
- Include a "Reset" button to return to defaults
- Show formulas and equations where relevant
- Provide immediate visual feedback for parameter changes
- Ensure scientifically accurate calculations
- Make it engaging and discovery-oriented`;
  
  // Add age-specific considerations if provided
  if (additionalContext?.targetAge) {
    enhancedPrompt += `\n\nTarget age group: ${additionalContext.targetAge} years old`;
  }
  
  return enhancedPrompt;
}

// Validation prompt for educational accuracy
export function generateValidationPrompt(code: string, concept: string): string {
  return `Review this educational ${concept} visualization code for:
1. Scientific accuracy of calculations
2. Appropriate complexity for learning
3. Clear educational value
4. Proper interactivity
5. Accessibility features

Identify any issues and suggest improvements.`;
}

// Generate follow-up prompt for improvements
export function generateImprovementPrompt(
  code: string,
  validationFeedback: string[],
  targetImprovement: 'accuracy' | 'pedagogy' | 'interactivity'
): string {
  const improvementFocus = {
    accuracy: 'Ensure all calculations use correct formulas and units. Add validation for parameter ranges.',
    pedagogy: 'Add more educational elements like labels, explanations, and visual cues for learning.',
    interactivity: 'Add more interactive controls and real-time feedback to encourage exploration.'
  };
  
  return `Improve this visualization by addressing these issues:
${validationFeedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Focus especially on: ${improvementFocus[targetImprovement]}

Maintain all existing functionality while making improvements.`;
}

// Chain-of-thought prompt for complex visualizations
export function generateChainOfThoughtPrompt(concept: string, requirements: string[]): string {
  return `Let's create a ${concept} visualization step by step:

1. First, identify the key educational concepts to visualize
2. Determine the essential parameters users should control
3. Plan the layout and visual elements
4. Implement the core visualization
5. Add interactivity and controls
6. Ensure scientific accuracy
7. Add educational enhancements

Requirements:
${requirements.map(r => `- ${r}`).join('\n')}

Generate the complete implementation following this thought process.`;
}

// Few-shot examples for better generation
export const FEW_SHOT_EXAMPLES = {
  svgSetup: `
// Example of proper SVG setup with fixed dimensions
// Clear existing content first
d3.select("#visualization").selectAll("*").remove();

// Set fixed dimensions
const width = 800;
const height = 400;
const margin = {top: 40, right: 40, bottom: 50, left: 60};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Create SVG with fixed dimensions
const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Create main group with margins
const g = svg.append("g")
  .attr("transform", \`translate(\${margin.left},\${margin.top})\`);`,
  
  parameterControl: `
// Example of a well-designed parameter control
const controls = d3.select("#visualization")
  .append("div")
  .attr("class", "controls")
  .style("margin-top", "10px");

const slider = controls.append("div")
  .attr("class", "slider-container");

slider.append("label")
  .text("Length: ")
  .append("span")
  .attr("id", "length-value")
  .text(length + " m");

slider.append("input")
  .attr("type", "range")
  .attr("min", 0.5)
  .attr("max", 2)
  .attr("step", 0.1)
  .attr("value", length)
  .on("input", function(event) {
    length = +event.target.value;
    d3.select("#length-value").text(length + " m");
    updateVisualization();
  });`,
  
  scientificCalculation: `
// Example of accurate physics calculation
function calculatePendulumPeriod(length, gravity = 9.81) {
  // T = 2π√(L/g) - Simple pendulum formula
  return 2 * Math.PI * Math.sqrt(length / gravity);
}

// Display with appropriate precision
const period = calculatePendulumPeriod(length);
d3.select("#period-display")
  .text(\`Period: \${period.toFixed(2)} s\`);`,
  
  educationalLabeling: `
// Example of clear educational labeling
// Add axis labels with units
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Displacement (m)");

// Add title with concept
svg.append("text")
  .attr("x", width / 2)
  .attr("y", 0 - margin.top / 2)
  .style("text-anchor", "middle")
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .text("Simple Harmonic Motion");`
};