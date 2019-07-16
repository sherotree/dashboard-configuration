import React from 'react';
import { Form, Input, Switch, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { panelSettingPrefix } from '../../../utils/constants';
import { formPositionLayout } from './utils';
import { funcValidator } from '../../charts/utils';
import EditorForm from '../../editor-form';

const { Option } = Select;
const panelSettingYAxisPrefix = `${panelSettingPrefix}yAxis#`;

type IProps = FormComponentProps;

const PanelSettings = ({ form: { getFieldDecorator } }: IProps) => (
  <React.Fragment>
    <Form.Item label="show" {...formPositionLayout}>
      {getFieldDecorator(`${panelSettingYAxisPrefix}show`, {
        initialValue: true,
        valuePropName: 'checked',
      })(<Switch />)}
    </Form.Item>
    <Form.Item label="type" {...formPositionLayout}>
      {getFieldDecorator(`${panelSettingYAxisPrefix}type`, {
        initialValue: 'value',
      })(
        <Select>
          <Option value="value">value</Option>
          <Option value="category">category</Option>
          <Option value="time">time</Option>
        </Select>
      )}
    </Form.Item>
    <Form.Item label="name" {...formPositionLayout}>
      {getFieldDecorator(`${panelSettingYAxisPrefix}name`, {
      })(<Input />)}
    </Form.Item>
    <Form.Item label="axisLabel.fomater" {...formPositionLayout}>
      {getFieldDecorator(`${panelSettingYAxisPrefix}axisLabel#formatter`, {
        rules: [{
          validator: funcValidator,
        }],
      })(<EditorForm
        placeholder="输入fomater函数. e.g.
        function(value){
            if(value > 1024) return value/1024 + 'MB';
            else return value + 'KB';
        }"
      />)}
    </Form.Item>
  </React.Fragment>
);

export default PanelSettings;