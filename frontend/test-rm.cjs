const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

import('react-markdown').then(rm => {
  const RM = rm.default || rm.ReactMarkdown || rm;
  const html = renderToStaticMarkup(
    React.createElement(RM, {
      components: {
        code: (props) => React.createElement('div', { 
          'data-inline': props.inline === undefined ? 'undefined' : props.inline, 
          'data-class': props.className 
        }, props.children)
      }
    }, '```sql\nselect * from t\n```\n\n`inline`')
  );
  console.log(html);
});
