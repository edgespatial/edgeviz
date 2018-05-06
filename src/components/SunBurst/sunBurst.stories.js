import React from 'react';
import { storiesOf } from '@storybook/react';
import SunBurst from './sunBurst';
import mockData from './sunBurst.fixtures';

storiesOf('SunBurst', module).add('Default', () => (
  <SunBurst data={mockData} width={400} height={400} sumKey="size" />
));
