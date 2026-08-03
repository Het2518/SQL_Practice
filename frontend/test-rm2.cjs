const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

import('react-markdown').then(rm => {
  const RM = rm.default || rm.ReactMarkdown || rm;
  const html = renderToStaticMarkup(
    React.createElement(RM, {
      components: {
        pre: (props) => {
          const child = props.children;
          return React.createElement('div', { 'data-pre': 'true', 'data-child-type': child ? child.type : 'none' }, 
            child && child.props ? String(child.props.children) : 'no-props'
          );
        },
        code: (props) => React.createElement('span', { 'data-inline': 'true' }, props.children)
      }
    }, '```sql\nselect * from t;\n```\n\n`inline_code`\n\n    indented code block\n')
  );
  console.log(html);
});
