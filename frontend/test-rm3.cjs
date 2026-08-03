const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const CodeBlock = ({ code, language }) => React.createElement('div', { className: 'code-block', 'data-lang': language }, code);

import('react-markdown').then(rm => {
  const RM = rm.default || rm.ReactMarkdown || rm;
  const html = renderToStaticMarkup(
    React.createElement(RM, {
      components: {
        pre: ({ node, children, ...props }) => {
          const child = Array.isArray(children) ? children[0] : children;
          if (child && child.props && child.props.node && child.props.node.tagName === 'code') {
             const className = child.props.className || '';
             const match = /language-(\w+)/.exec(className);
             const codeText = String(child.props.children).replace(/\n$/, '');
             return React.createElement(CodeBlock, { code: codeText, language: match ? match[1] : 'sql' });
          }
          return React.createElement('pre', props, children);
        },
        code: ({ node, className, children, ...props }) => {
          return React.createElement('code', Object.assign({ className: "inline-code" }, props), children);
        }
      }
    }, '```sql\nselect * from t;\n```\n\n`inline_code`\n\n    indented block\n')
  );
  console.log(html);
});
