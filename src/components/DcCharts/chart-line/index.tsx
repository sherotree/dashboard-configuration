/**
 * 2D 线形图：折线、柱状、曲线
 */
import { ChartSizeMe } from '../common';
import * as React from 'react';
import { getOption } from './option';

interface IProps {
  data: any;
  config: {
    option: object;
  };
}

const ChartLine = React.forwardRef((props: IProps, ref: React.Ref<any>) => (
  <ChartSizeMe {...props} option={getOption(props.data, props.config)} ref={ref} />
));

export default ChartLine;
