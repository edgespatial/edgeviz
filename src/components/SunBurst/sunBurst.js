import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { arc } from 'd3-shape';
import { select, selectAll, event } from 'd3-selection'; // eslint-disable-line
import { interpolate } from 'd3-interpolate';
import { scaleSqrt, scaleLinear, scaleOrdinal } from 'd3-scale';
import { transition } from 'd3-transition'; // eslint-disable-line
import { schemeCategory10 } from 'd3-scale-chromatic';
import { path } from 'd3-path';
import { hierarchy, partition } from 'd3-hierarchy';

import { theme } from '../../constants';

const Svg = styled.svg`
  max-width: 400px;
  .slice {
    cursor: pointer;
  }

  .slice .main-arc {
    stroke: #fff;
    stroke-width: 1px;
  }

  .slice .hidden-arc {
    fill: none;
  }
  .slice text {
    pointer-events: none;
    dominant-baseline: middle;
    text-anchor: middle;
  }
`;
Svg.defaultProps = {
  theme,
};

class SunBurst extends Component {
  static defaultProps = {
    data: {},
    width: 208,
    height: 140,
  };

  static propTypes = {
    data: PropTypes.object,
    height: PropTypes.number,
    width: PropTypes.number,
  };
  componentDidMount() {
    const { width, height } = this.props;

    this.sunBurstContainer = this.svg.attr(
      'viewBox',
      `${-width / 2} ${-height / 2} ${width} ${height}`,
    );
    this.renderSunBurst();
  }
  renderSunBurst() {
    const { data, height, width } = this.props;
    let maxRadius = Math.min(width, height) / 2;
    maxRadius -= 5;
    this.x = scaleLinear()
      .range([0, 2 * Math.PI])
      .clamp(true);
    this.y = scaleSqrt().range([maxRadius * 0.1, maxRadius]);
    this.color = scaleOrdinal(schemeCategory10);
    this.partition = partition();
    this.arc = arc()
      .startAngle(d => this.x(d.x0))
      .endAngle(d => this.x(d.x1))
      .innerRadius(d => Math.max(0, this.y(d.y0)))
      .outerRadius(d => Math.max(0, this.y(d.y1)));

    this.root = hierarchy(data);
    this.root.sum(d => d.size);
    this.slice = this.svg
      .selectAll('g.slice')
      .data(this.partition(this.root).descendants());
    // Exit
    this.slice.exit().remove();
    // Enter
    this.newSlice = this.slice
      .enter()
      .append('g')
      .attr('class', 'slice')
      .on('click', d => {
        event.stopPropagation();
        this.focusOn(d);
      });

    this.newSlice.append('title').text(d => `${d.data.name}`);

    this.newSlice
      .append('path')
      .attr('class', 'main-arc')
      .style('fill', d => this.color((d.children ? d : d.parent).data.name))
      .attr('d', this.arc);

    this.newSlice
      .append('path')
      .attr('class', 'hidden-arc')
      .attr('id', (_, i) => `hiddenArc${i}`)
      .attr('d', this.middleArcLine);

    this.text = this.newSlice
      .append('text')
      .attr('display', d => (this.textFits(d) ? null : 'none'));

    this.text
      .append('textPath')
      .attr('startOffset', '50%')
      .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
      .text(d => d.data.name)
      .style('fill', 'none')
      .style('stroke', '#fff')
      .style('stroke-width', 5)
      .style('stroke-linejoin', 'round');

    this.text
      .append('textPath')
      .attr('startOffset', '50%')
      .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
      .text(d => d.data.name);
  }

  middleArcLine = d => {
    const halfPi = Math.PI / 2;
    const angles = [this.x(d.x0) - halfPi, this.x(d.x1) - halfPi];
    const r = Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) {
      angles.reverse();
    }

    this.path = path();
    this.path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return this.path.toString();
  };
  textFits = d => {
    const CHAR_SPACE = 6;

    const deltaAngle = this.x(d.x1) - this.x(d.x0);
    const r = Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    return d.data.name.length * CHAR_SPACE < perimeter;
  };

  focusOn = (d = { x0: 0, x1: 1, y0: 0, y1: 1 }) => {
    // Reset to top-level if no data point specified
    const transition = this.sunBurstContainer
      .transition()
      .duration(750)
      .tween('scale', () => {
        const xd = interpolate(this.x.domain(), [d.x0, d.x1]);
        const yd = interpolate(this.y.domain(), [d.y0, 1]);
        return t => {
          this.x.domain(xd(t));
          this.y.domain(yd(t));
        };
      });

    transition
      .selectAll('path.main-arc')
      .attrTween('d', d => () => this.arc(d));

    transition
      .selectAll('path.hidden-arc')
      .attrTween('d', d => () => this.middleArcLine(d));

    transition
      .selectAll('text')
      .attrTween('display', d => () => (this.textFits(d) ? null : 'none'));

    moveStackToFront(d);

    function moveStackToFront(elD) {
      transition
        .selectAll('.slice')
        .filter(d => d === elD)
        .each(function(d) {
          this.parentNode.appendChild(this);
          if (d.parent) {
            moveStackToFront(d.parent);
          }
        });
    }
  };
  render() {
    return (
      <Svg
        width={400}
        height={400}
        innerRef={node => {
          this.svg = select(node);
        }}
      />
    );
  }
}

export default SunBurst;
