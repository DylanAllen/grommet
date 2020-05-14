import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Box } from '../Box';
import { Chart, calcs } from '../Chart';
import { Grid } from '../Grid';
import { Stack } from '../Stack';

const halfPad = {
  xlarge: 'large',
  large: 'medium',
  medium: 'small',
  small: 'xsmall',
};

const DataChart = ({
  chart,
  data,
  pad: padProp,
  size,
  steps = [1, 1],
  thickness: thicknessProp,
  xAxis,
  yAxis,
  ...rest
}) => {
  // refs used for ie11 not having Grid
  const xRef = useRef();
  const spacerRef = useRef();

  // normalize chart to an array
  const charts = useMemo(() => (Array.isArray(chart) ? chart : [chart]), [
    chart,
  ]);

  // map the key values into their own arrays
  const keyValues = useMemo(() => {
    const result = {};
    charts.forEach(({ key, keys }) => {
      if (key && !result[key]) {
        result[key] = data.map(d => d[key]);
      }
      if (keys) {
        keys.forEach(({ key: innerKey }) => {
          if (innerKey && !result[innerKey]) {
            result[innerKey] = data.map(d => d[innerKey]);
          }
        });
      }
    });
    return result;
  }, [charts, data]);

  // setup the values for each chart
  const chartValues = useMemo(() => {
    return charts.map(({ key, keys }) => {
      if (key) return keyValues[key];
      const totals = [];
      return keys.map(({ key: innerKey }) =>
        keyValues[innerKey].map((v, i) => {
          const base = totals[i] || 0;
          totals[i] = base + v;
          return [i, base, base + v];
        }),
      );
    });
  }, [charts, keyValues]);

  // calculate axis, bounds and thickness
  const { axis, bounds, thickness } = useMemo(() => {
    let tmpAxis;
    let tmpBounds;
    let tmpThickness = thicknessProp;
    charts.forEach(({ keys }, index) => {
      (keys ? chartValues[index] : [chartValues[index]]).forEach(vals => {
        const { axis: a, bounds: b, thickness: t } = calcs(vals, {
          steps,
          thickness: tmpThickness,
        });
        tmpAxis = a;
        tmpBounds = b;
        tmpThickness = t;
      });
    });
    return { axis: tmpAxis, bounds: tmpBounds, thickness: tmpThickness };
  }, [charts, chartValues, steps, thicknessProp]);

  // set the pad to have the thickness, if not defined
  const pad = useMemo(() => {
    if (padProp !== undefined) return padProp;
    const padSize = halfPad[thickness];
    const allSides =
      charts.filter(({ type }) => type && type !== 'bar').length > 0;
    if (allSides) return padSize;
    return { horizontal: padSize };
  }, [charts, padProp, thickness]);

  const xGuide = useMemo(
    () =>
      axis[0].map((_, i) => {
        if (xAxis && xAxis.guide) {
          if (i === 0) return 'left';
          if (i === axis[0].length - 1) return 'right';
        }
        return undefined;
      }),
    [axis, xAxis],
  );

  const yGuide = useMemo(
    () =>
      axis[1].map((_, i) => {
        if (yAxis && yAxis.guide) {
          if (i === 0) return 'top';
          if (i === axis[1].length - 1) return 'bottom';
        }
        return undefined;
      }),
    [axis, yAxis],
  );

  // for ie11, align the spacer Box height to the x-axis height
  useLayoutEffect(() => {
    if (xRef.current && spacerRef.current) {
      const rect = xRef.current.getBoundingClientRect();
      spacerRef.current.style.height = `${rect.height}px`;
    }
  }, []);

  /* eslint-disable react/no-array-index-key */
  let xAxisElement;
  if (xAxis) {
    xAxisElement = (
      <Box ref={xRef} gridArea="xAxis" direction="row" justify="between">
        {axis[0].map((a, i) => {
          let content;
          if (xAxis.render) content = xAxis.render(a, i);
          else if (xAxis.key) content = data[i][xAxis.key];
          else content = a;
          return <Box key={i}>{content}</Box>;
        })}
      </Box>
    );
  }

  let yAxisElement;
  if (yAxis) {
    yAxisElement = (
      <Box gridArea="yAxis" justify="between" flex>
        {axis[1].map((a, i) => {
          let content;
          if (yAxis.render) content = yAxis.render(a, i);
          else content = a;
          return (
            <Box key={i} align="end">
              {content}
            </Box>
          );
        })}
      </Box>
    );
  }

  const stackElement = (
    <Stack gridArea="charts" guidingChild="last">
      {xAxis && xAxis.guide && (
        <Box fill direction="row" justify="between" pad={pad}>
          {xGuide.map((_, i) => (
            <Box key={i} border="left" />
          ))}
        </Box>
      )}
      {yAxis && yAxis.guide && (
        <Box fill justify="between" pad={pad}>
          {yGuide.map((_, i) => (
            <Box key={i} border="top" />
          ))}
        </Box>
      )}
      {charts.map(({ key, keys, ...chartRest }, i) => {
        if (keys) {
          // reverse to ensure area Charts are stacked in the right order
          return keys
            .map((_, j) => (
              <Chart
                key={j}
                values={chartValues[i][j]}
                color={keys[j].color}
                bounds={bounds}
                overflow
                pad={pad}
                size={size}
                thickness={thickness}
                {...chartRest}
              />
            ))
            .reverse();
        }
        return (
          <Chart
            key={i}
            values={chartValues[i]}
            bounds={bounds}
            overflow
            pad={pad}
            size={size}
            thickness={thickness}
            {...chartRest}
          />
        );
      })}
    </Stack>
  );

  // IE11
  if (!Grid.available) {
    let content = stackElement;
    if (xAxisElement) {
      content = (
        <Box>
          {content}
          {xAxisElement}
        </Box>
      );
    }
    if (yAxisElement) {
      content = (
        <Box direction="row">
          <Box>
            {yAxisElement}
            <Box ref={spacerRef} flex={false} />
          </Box>
          {content}
        </Box>
      );
    }
    return content;
  }

  return (
    <Grid
      columns={['auto', 'flex']}
      rows={['flex', 'auto']}
      areas={[
        { name: 'yAxis', start: [0, 0], end: [0, 0] },
        { name: 'xAxis', start: [1, 1], end: [1, 1] },
        { name: 'charts', start: [1, 0], end: [1, 0] },
      ]}
      {...rest}
    >
      {xAxisElement}
      {yAxisElement}
      {stackElement}
    </Grid>
  );
};

DataChart.displayName = 'DataChart';

let DataChartDoc;
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  DataChartDoc = require('./doc').doc(DataChart);
}
const DataChartWrapper = DataChartDoc || DataChart;

export { DataChartWrapper as DataChart };
