# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduViz-AI is an AI-powered educational visualization platform that generates interactive D3.js visualizations from natural language descriptions. Built as the next evolution of Seeing-Theory, it aims to revolutionize education by making any concept instantly visualizable and understandable.

## Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v3.4.1
- **Visualization**: D3.js v7 for all educational graphics
- **AI Integration**: OpenAI GPT-4 (transitioning to Claude API)
- **Execution**: WebContainers API for secure browser-based code execution
- **State Management**: React hooks and context (no external state library needed)

### Project Structure
```
eduviz-ai/
├── app/
│   ├── api/
│   │   └── generate/          # AI generation endpoints (future)
│   ├── components/
│   │   ├── PromptInput/       # Natural language input interface
│   │   ├── Preview/           # Live visualization preview with D3.js
│   │   └── Editor/            # Code display with syntax highlighting
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── orchestrator.ts   # AI model routing and management
│   │   │   ├── prompts.ts        # Educational prompt templates
│   │   │   └── validator.ts      # Code validation and safety checks
│   │   ├── templates/
│   │   │   ├── physics/          # Physics visualization templates
│   │   │   ├── math/             # Mathematics templates
│   │   │   └── chemistry/        # Chemistry templates
│   │   └── webcontainer/
│   │       └── sandbox.ts        # WebContainer integration
│   ├── globals.css            # Global styles with CSS variables
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main application page
├── public/
│   └── examples/              # Static examples and assets
├── next.config.mjs            # Next.js configuration
├── tailwind.config.js         # Tailwind CSS v3 configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies and scripts
```

## Key Development Patterns

### D3.js Visualization Pattern
Each educational visualization follows these principles:
```javascript
// 1. Select the #visualization container
const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// 2. Create interactive elements
// Always include parameter controls (sliders, buttons)
// Show both theoretical and observed values
// Use smooth transitions for better understanding

// 3. Educational focus
// Clear labels and units
// Real-time feedback
// Scientifically accurate calculations
// Accessibility features
```

### AI Prompt Engineering
Educational prompts are enhanced with subject-specific templates:
- Physics: pendulum, waves, projectile motion
- Mathematics: derivatives, integration, vectors
- Chemistry: molecules, reactions, periodic table

Each template includes requirements for:
- Interactive parameters
- Visual clarity
- Scientific accuracy
- Progressive complexity

### Component Guidelines
1. **Type Safety**: All components use TypeScript with strict types
2. **Accessibility**: ARIA labels, keyboard navigation, color contrast
3. **Performance**: Lazy loading, memoization where needed
4. **Error Handling**: Graceful fallbacks, user-friendly messages

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Testing Visualizations
1. Start the dev server: `npm run dev`
2. Try the pendulum demo: "Show me how a pendulum works"
3. Check browser console for errors
4. Verify interactive elements work correctly

## Important Constraints

### Security
- All generated code is validated before execution
- No eval(), Function(), or dynamic imports allowed
- WebContainers provide sandboxed execution
- Input sanitization for all user prompts

### Performance
- Visualizations must render in <2 seconds
- Smooth 60fps animations
- Efficient D3.js selections and updates
- Minimal re-renders in React components

### Educational Requirements
- Scientific accuracy is paramount
- All physics simulations must use correct formulas
- Math visualizations must be pedagogically sound
- Clear labeling and units required

### Browser Compatibility
- Modern browsers only (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript is acceptable
- WebContainers require specific browser features
- Mobile responsiveness not required (desktop-first)

## Configuration Notes

### Package.json Specifics
- Tailwind CSS v3.4.1 (not v4) - v4 has compatibility issues
- PostCSS 8.4.31 - specific version for stability
- No turbopack flag - causes issues with WebContainers
- D3.js loaded via CDN in visualizations for simplicity

### Next.js Configuration
The `next.config.mjs` includes:
- Webpack fallbacks for Node.js modules (fs, path, etc.)
- Transpile packages configuration for D3.js
- No experimental features enabled

### Styling
- CSS variables for theming
- Dark mode support throughout
- Consistent color palette:
  - Primary: Blue (#3b82f6)
  - Success: Green (#10b981)
  - Error: Red (#ef4444)
  - Gray scale for UI elements

## Future Development Roadmap

### Phase 1: Core Features (Current)
- ✅ Basic visualization generation
- ✅ Pendulum physics demo
- ✅ Clean, accessible UI
- ⏳ More physics templates
- ⏳ Claude API integration

### Phase 2: Scale (Next 3 months)
- [ ] 50+ visualization templates
- [ ] Teacher dashboard
- [ ] Student progress tracking
- [ ] Backend integration
- [ ] Real-time collaboration

### Phase 3: Monetization (6 months)
- [ ] School/district licensing
- [ ] Premium templates marketplace
- [ ] LMS integrations
- [ ] White-label options
- [ ] API for developers

## Testing Approach

### Manual Testing Checklist
- [ ] Pendulum demo generates correctly
- [ ] All interactive controls work
- [ ] Dark mode displays properly
- [ ] Error messages are helpful
- [ ] Code display is readable

### Future Automated Testing
- Unit tests for AI prompt generation
- Integration tests for WebContainers
- Visual regression tests for D3.js output
- Accessibility testing with axe-core

## Deployment

### Vercel Deployment (Recommended)
```bash
vercel --prod
```

### Environment Variables (Future)
```
OPENAI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
```

## Troubleshooting

### Common Issues

1. **"Module not found: Can't resolve 'fs'"**
   - Ensure next.config.mjs has webpack fallbacks
   - Check that WebContainers code is client-side only

2. **Tailwind CSS not working**
   - Must use v3.4.1, not v4
   - Check tailwind.config.js content paths
   - Ensure globals.css uses @tailwind directives

3. **D3.js visualization not rendering**
   - Check browser console for errors
   - Verify #visualization element exists
   - Ensure D3 is loaded before code execution

## Contributing Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Comment complex algorithms
- Keep functions small and focused

### Commit Messages
- Use conventional commits format
- Reference issue numbers
- Keep messages concise but descriptive

### Pull Request Process
1. Create feature branch from main
2. Implement with tests
3. Update documentation
4. Request review from team

## Vision

EduViz-AI aims to become the premier platform for AI-generated educational visualizations. By combining the pedagogical excellence of Seeing-Theory with cutting-edge AI capabilities, we're building a tool that will transform how complex concepts are taught and understood globally.

The goal: Make every student's "aha!" moment just a prompt away.