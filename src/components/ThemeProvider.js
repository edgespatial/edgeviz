import React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';
import { theme } from '../constants';

const EdgevizThemeProvider = props => (
  <ThemeProvider theme={{ ...theme, ...props.theme }}>
    {props.children}
  </ThemeProvider>
);

EdgevizThemeProvider.propTypes = {
  children: PropTypes.node,
  theme: PropTypes.object,
};

export default EdgevizThemeProvider;
