const fs = require('fs');
const path = require('path');

const replacement = `components={{
  pre({ node, children, ...props }) {
    const child = Array.isArray(children) ? children[0] : children;
    if (child && child.props && child.props.node && child.props.node.tagName === 'code') {
      const className = child.props.className || '';
      const match = /language-(\\w+)/.exec(className);
      const codeText = String(child.props.children).replace(/\\n$/, '');
      return (
        <div className="not-prose">
          <CodeBlock code={codeText} language={match ? match[1] : 'sql'} />
        </div>
      );
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
  
  // Replace the exact broken block we injected earlier
  const regex1 = /components=\{\{\s*pre\(\{[\s\S]*?\}\s*\}\}/g;
  
  let newContent = content.replace(regex1, replacement);
  
  // also check if the old "inline" buggy block is still there for some reason
  const regex2 = /components=\{\{\s*code\(\{\s*node,\s*inline,\s*className,\s*children,\s*\.\.\.props\s*\}\)\s*\{\s*const\s*match.*?return\s*\([\s\S]*?\}\s*\}\}/g;
  newContent = newContent.replace(regex2, replacement);
  
  const regex3 = /components=\{\{\s*code\(\{\s*node,\s*inline,\s*className,\s*children,\s*\.\.\.props\s*\}\)\s*\{\s*if\s*\(inline\)\s*\{\s*return\s*\([\s\S]*?\}\s*\}\}/g;
  newContent = newContent.replace(regex3, replacement);
  
  fs.writeFileSync(filePath, newContent);
  console.log('Fixed', filePath);
}

fixFile(path.join(__dirname, 'src/features/ai/AiTutorPanel.jsx'));
fixFile(path.join(__dirname, 'src/features/interview/InterviewArena.jsx'));
fixFile(path.join(__dirname, 'src/features/interview/InterviewReport.jsx'));
