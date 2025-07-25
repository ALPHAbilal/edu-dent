# EduViz AI - Interactive Educational Visualizations

Transform complex concepts into interactive visualizations with AI. Built on the foundation of Seeing-Theory, EduViz AI generates D3.js visualizations from natural language descriptions.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🎯 Features

- **Natural Language Input**: Describe what you want to visualize
- **AI-Powered Generation**: Creates complete D3.js visualizations
- **Interactive Learning**: All visualizations include adjustable parameters
- **Multi-Subject Support**: Physics, Mathematics, and Chemistry templates
- **Real-time Preview**: See results instantly in the browser
- **Educational Focus**: Scientifically accurate and pedagogically sound

## 🧪 Demo

Try these prompts:
- "Show me how a pendulum works" (currently implemented)
- "Demonstrate wave interference" (coming soon)
- "Visualize derivatives" (coming soon)

## 🏗️ Architecture

```
EduViz-AI/
├── app/
│   ├── components/
│   │   ├── PromptInput/    # Natural language input
│   │   ├── Preview/        # Live visualization preview
│   │   └── Editor/         # Code display
│   ├── lib/
│   │   ├── ai/            # AI orchestration & prompts
│   │   ├── templates/      # Subject-specific templates
│   │   └── webcontainer/   # Sandbox execution
│   └── page.tsx           # Main application
```

## 🔧 Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Visualization**: D3.js v7
- **AI**: OpenAI GPT-4 (Claude API coming soon)
- **Execution**: WebContainers API for secure sandboxing
- **Validation**: Multi-layer accuracy checking

## 📚 Next Steps

1. **WebContainers Integration**: Full sandbox implementation
2. **Claude API**: Switch from OpenAI to Anthropic
3. **More Templates**: Expand physics, add chemistry/biology
4. **Teacher Dashboard**: Progress tracking and customization
5. **Deployment**: Vercel hosting with Supabase backend

## 🤝 Contributing

This is the beginning of something revolutionary in education. We're building the future where any concept can be instantly visualized and understood.

## 📄 License

MIT License - Making education accessible to everyone.

---

Built with ❤️ for educators and students worldwide.