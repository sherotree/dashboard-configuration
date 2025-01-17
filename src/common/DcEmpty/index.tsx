import * as React from 'react';
import { Empty } from 'antd';

interface IProps {
  condition?: any;
  className?: string;
}

const DcEmpty = ({ condition = true, className, ...emptyProps }: Merge<typeof Empty.defaultProps, IProps>) => (
  <If condition={condition}>
    <div className={`dc-empty-holder center-flex-box${className ? ` ${className}` : ''}`}>
      <Empty {...emptyProps} />
    </div>
  </If>
);

export { DcEmpty };
