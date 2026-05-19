import { visit } from 'unist-util-visit';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

interface MermaidPluginOptions {
  outputDir?: string;
}

export function remarkMermaid(options: MermaidPluginOptions = {}) {
  return function (tree: any) {
    const warnings: string[] = [];

    visit(tree, 'code', async (node: any, index: number) => {
      if (node.lang !== 'mermaid') return;

      const mermaidCode = node.value;

      try {
        const svg = await renderMermaid(mermaidCode);
        const svgNode = {
          type: 'html',
          value: `<div class="mermaid">${svg}</div>`,
        };

        tree.children[index] = svgNode;
      } catch (error: any) {
        warnings.push(`Mermaid rendering failed: ${error.message}`);
        const fallbackNode = {
          type: 'html',
          value: `<pre class="mermaid-fallback"><code>${escapeHtml(mermaidCode)}</code></pre>`,
        };
        tree.children[index] = fallbackNode;
      }
    });

    if (warnings.length > 0) {
      console.warn('Mermaid processing warnings:', warnings.join('; '));
    }
  };
}

async function renderMermaid(code: string): Promise<string> {
  const tempDir = '/tmp/mermaid-render';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const inputFile = path.join(tempDir, `input-${Date.now()}.mmd`);
  const outputFile = path.join(tempDir, `output-${Date.now()}.svg`);

  try {
    fs.writeFileSync(inputFile, code);

    const result = execSync(`npx mermaid -p -i ${inputFile} -o ${tempDir} 2>&1`, {
      encoding: 'utf-8',
      timeout: 30000,
    });

    const files = fs.readdirSync(tempDir);
    const svgFile = files.find(f => f.endsWith('.svg'));

    if (svgFile) {
      const svgContent = fs.readFileSync(path.join(tempDir, svgFile), 'utf-8');
      return svgContent.replace(/<svg/, '<svg class="mermaid-diagram"');
    }

    throw new Error('SVG not generated');
  } finally {
    try {
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
    } catch {}
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}