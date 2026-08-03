const fs = require('fs');
const path = require('path');

const replacement = `components={{
  pre({ node, children, ...props }) {
    const child = Array.isArray(children) ? children[0] : children;
    if (child && child.props && child.props.node && child.props.node.tagName === 'code') {
      const className = child.props.className || '';
      const match = /language-(\w+)/.exec(className);
      const codeText = String(child.props.children).replace(/\\n$/, '');
      return <CodeBlock code={codeText} language={match ? match[1] : 'sql'} />;
    }
    return <pre {...props}>{children}</pre>;
  },
  code({ node, className, children, ...props }) {
    return (
      <code className="bg-primary-muted text-text px-1.5 py-0.5 rounded text-[13px] font-mono border border-border" {...props}>
        {children}
      </code>
    );
  }
}}`;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the buggy ReactMarkdown components block
  // The block starts with components={{ and ends with }}
  // We can use a regex to replace it
  const regex = /components=\{\{\s*code\(\{\s*node,\s*inline,\s*className,\s*children,\s*\.\.\.props\s*\}\)\s*\{\s*const\s*match.*?return\s*\([\s\S]*?\}\s*\}\}/g;
  
  // Also match the corrupted one in InterviewArena
  const corruptedRegex = /components=\{\{\s*code\(\{\s*node,\s*inline,\s*className,\s*children,\s*\.\.\.props\s*\}\)\s*\{\s*if\s*\(inline\)\s*\{\s*return\s*\([\s\S]*?\}\s*\}\}/g;

  let newContent = content.replace(regex, replacement).replace(corruptedRegex, replacement);
  
  fs.writeFileSync(filePath, newContent);
  console.log('Fixed', filePath);
}

fixFile(path.join(__dirname, 'src/features/ai/AiTutorPanel.jsx'));
fixFile(path.join(__dirname, 'src/features/interview/InterviewArena.jsx'));
fixFile(path.join(__dirname, 'src/features/interview/InterviewReport.jsx'));
