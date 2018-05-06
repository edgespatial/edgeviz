/* eslint global-require: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Catalog } from 'catalog';

import './styles.css';

const pages = [
  { path: '/', title: 'Introduction', component: require('./introduction.md') },
  { path: '/colors', title: 'Colors', component: require('./colors.md') },
  {
    title: 'Typography',
    pages: [
      {
        path: '/typography',
        title: 'How to',
        component: require('./typography.md'),
      },
    ],
  },
  {
    title: 'Components',
    pages: [
      {
        path: '/components',
        title: 'Introduction',
        component: require('./components.md'),
      },
    ],
  },
];

const theme = {
  // Patterns
  checkerboardPatternLight:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  checkerboardPatternDark:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkWAsAALMAr6o4KHcAAAAASUVORK5CYII=',
};

ReactDOM.render(
  <Catalog title="EdgeViz" pages={pages} theme={theme} />,
  document.getElementById('catalog'),
);
