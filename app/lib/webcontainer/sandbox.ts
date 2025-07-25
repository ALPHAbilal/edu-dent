import { WebContainer } from '@webcontainer/api';

export class EducationalSandbox {
  private webcontainerInstance: WebContainer | null = null;
  private bootPromise: Promise<void> | null = null;

  async initialize() {
    if (this.bootPromise) {
      await this.bootPromise;
      return;
    }

    this.bootPromise = this.boot();
    await this.bootPromise;
  }

  private async boot() {
    try {
      this.webcontainerInstance = await WebContainer.boot();
      console.log('WebContainer booted successfully');
    } catch (error) {
      console.error('Failed to boot WebContainer:', error);
      throw error;
    }
  }

  async executeVisualization(code: string, dependencies: string[] = ['d3']) {
    if (!this.webcontainerInstance) {
      await this.initialize();
    }

    // Create a basic package.json with D3 and other dependencies
    const packageJson = {
      name: 'educational-viz',
      type: 'module',
      dependencies: dependencies.reduce((acc, dep) => {
        acc[dep] = 'latest';
        return acc;
      }, {} as Record<string, string>)
    };

    // Create the file structure
    await this.webcontainerInstance!.mount({
      'package.json': {
        file: {
          contents: JSON.stringify(packageJson, null, 2)
        }
      },
      'index.html': {
        file: {
          contents: this.createHTMLTemplate(code)
        }
      },
      'visualization.js': {
        file: {
          contents: code
        }
      }
    });

    // Install dependencies
    const installProcess = await this.webcontainerInstance!.spawn('npm', ['install']);
    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error('Failed to install dependencies');
    }

    // Return the preview URL
    return this.getPreviewUrl();
  }

  private createHTMLTemplate(jsCode: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Educational Visualization</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #fafafa;
        }
        #visualization {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            margin: 0 auto;
            max-width: 800px;
        }
    </style>
</head>
<body>
    <div id="visualization"></div>
    <script type="module">
        import * as d3 from 'https://cdn.skypack.dev/d3@7';
        window.d3 = d3;
        ${jsCode}
    </script>
</body>
</html>`;
  }

  async getPreviewUrl(): Promise<string> {
    if (!this.webcontainerInstance) {
      throw new Error('WebContainer not initialized');
    }

    // Start a dev server
    const serverProcess = await this.webcontainerInstance.spawn('npx', [
      'serve',
      '.',
      '-p',
      '3000'
    ]);

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    return 'http://localhost:3000';
  }

  async teardown() {
    if (this.webcontainerInstance) {
      // WebContainer doesn't have a teardown method in the current API
      // but we can clean up our reference
      this.webcontainerInstance = null;
    }
  }
}

export const sandbox = new EducationalSandbox();