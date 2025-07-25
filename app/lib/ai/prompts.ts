export const EDUCATIONAL_SYSTEM_PROMPT = `You are an expert educational visualization creator specializing in making complex concepts understandable through interactive D3.js visualizations.

Your visualizations follow these principles:
1. **Pedagogical Clarity**: Every visual element serves a learning purpose
2. **Interactive Learning**: Users can manipulate parameters to see effects
3. **Progressive Disclosure**: Start simple, add complexity through interaction
4. **Scientific Accuracy**: All physics, math, and science must be correct
5. **Accessibility**: Clear labels, color-blind friendly, keyboard navigable

You create complete, self-contained D3.js visualizations that run in the browser. Your code should:
- Use D3.js v7 syntax
- Include clear comments explaining the educational concepts
- Add interactive elements (sliders, buttons) for parameter exploration
- Show both theoretical and observed values where applicable
- Include smooth transitions for better understanding

IMPORTANT: Output ONLY the JavaScript code that will create the visualization. Do not include HTML, explanations, or markdown. The code should:
1. Select the #visualization element
2. Create the complete interactive visualization
3. Handle all user interactions
4. Be scientifically accurate`;

export const PHYSICS_TEMPLATES = {
  pendulum: `Create an interactive pendulum visualization showing:
- Adjustable length, mass, and initial angle
- Real-time period calculation
- Energy conservation display (potential vs kinetic)
- Trace of pendulum path
- Comparison with small angle approximation`,
  
  waves: `Create an interactive wave visualization showing:
- Adjustable frequency, amplitude, and wavelength
- Wave interference patterns
- Standing waves demonstration
- Sound wave vs light wave comparison
- Real-time wave equation display`,
  
  projectile: `Create an interactive projectile motion visualization showing:
- Adjustable launch angle and velocity
- Trajectory path with vectors
- Range and maximum height calculations
- Air resistance toggle
- Multiple projectile comparison`
};

export const MATH_TEMPLATES = {
  derivatives: `Create an interactive derivative visualization showing:
- Function input with live graphing
- Tangent line at adjustable point
- Derivative graph below original
- Slope calculation display
- Common function examples`,
  
  integration: `Create an interactive integration visualization showing:
- Riemann sum approximation
- Adjustable number of rectangles
- Exact area calculation
- Multiple integration methods
- Error visualization`,
  
  vectors: `Create an interactive vector visualization showing:
- 2D/3D vector addition
- Dot and cross products
- Vector decomposition
- Magnitude and direction
- Real-world applications`
};

export const CHEMISTRY_TEMPLATES = {
  molecules: `Create an interactive molecule visualization showing:
- 3D molecular structure
- Rotation and zoom controls
- Bond angles and lengths
- Electron density visualization
- Common molecule library`,
  
  reactions: `Create an interactive chemical reaction visualization showing:
- Reactants and products
- Energy diagram
- Reaction rate factors
- Equilibrium demonstration
- Molecular collision animation`,
  
  periodic: `Create an interactive periodic table showing:
- Element properties on hover
- Trends visualization
- Electron configuration
- Group and period highlighting
- Search and filter capabilities`
};

export function enhancePromptWithTemplate(userPrompt: string, subject: string): string {
  const prompt = userPrompt.toLowerCase();
  
  // Physics keywords
  if (prompt.includes('pendulum')) {
    return PHYSICS_TEMPLATES.pendulum;
  }
  if (prompt.includes('wave') || prompt.includes('frequency')) {
    return PHYSICS_TEMPLATES.waves;
  }
  if (prompt.includes('projectile') || prompt.includes('trajectory')) {
    return PHYSICS_TEMPLATES.projectile;
  }
  
  // Math keywords
  if (prompt.includes('derivative') || prompt.includes('tangent')) {
    return MATH_TEMPLATES.derivatives;
  }
  if (prompt.includes('integral') || prompt.includes('area under')) {
    return MATH_TEMPLATES.integration;
  }
  if (prompt.includes('vector')) {
    return MATH_TEMPLATES.vectors;
  }
  
  // Chemistry keywords
  if (prompt.includes('molecule') || prompt.includes('molecular')) {
    return CHEMISTRY_TEMPLATES.molecules;
  }
  if (prompt.includes('reaction') || prompt.includes('chemical')) {
    return CHEMISTRY_TEMPLATES.reactions;
  }
  if (prompt.includes('periodic') || prompt.includes('element')) {
    return CHEMISTRY_TEMPLATES.periodic;
  }
  
  // Default: use the user's prompt as-is with enhancement
  return `Create an interactive educational visualization for: ${userPrompt}. 
Include adjustable parameters, clear labels, and smooth animations to aid understanding.`;
}