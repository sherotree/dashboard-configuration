import * as React from 'react';
import { isFunction } from 'lodash';
import { Form, Input, Select, InputNumber, Switch, Radio, Checkbox } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const defalutFormItemLayout = {
  labelCol: {
    sm: { span: 24 },
    md: { span: 6 },
    lg: { span: 6 },
  },
  wrapperCol: {
    sm: { span: 24 },
    md: { span: 18 },
    lg: { span: 14 },
  },
};
const fullWrapperCol = { span: 24 };
const defalutTailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 24,
      offset: 0,
    },
    md: {
      span: 18,
      offset: 6,
    },
    lg: {
      span: 14,
      offset: 6,
    },
  },
};
export interface IFormItem {
  form?: WrappedFormUtils;
  label?: string;
  name?: string;
  type?: string;
  initialValue?: any;
  size?: 'default' | 'small' | 'large';
  required?: boolean;
  pattern?: RegExp | null;
  message?: string;
  itemProps?: any;
  extraProps?: object;
  rules?: any[];
  config?: object;
  options?: {name: string, value: string}[] | Function;
  suffix?: string | null;
  formItemLayout?: object;
  tailFormItemLayout?: object;
  formLayout?: string | null;
  noColon?: boolean;
  isTailLayout?: boolean ; // no label, put some offset to align right part
  onChange?: any;
  getComp?({ form }: {form: WrappedFormUtils}): React.ReactElement<any> | string;
}
export const RenderFormItem = ({
  form,
  label,
  name,
  type,
  initialValue = null,
  size = 'default',
  required = true,
  pattern = null,
  message = '请正确填写格式',
  itemProps = {},
  extraProps = {},
  rules = [],
  config,
  options = [],
  getComp,
  suffix = null,
  formItemLayout,
  formLayout,
  tailFormItemLayout,
  noColon = false,
  isTailLayout, // no label, put some offset to align right part
}: IFormItem) => {
  let ItemComp = null;
  const specialConfig: any = {};
  let _type = type;
  if (typeof getComp === 'function') {
    _type = 'custom';
  }
  let action = '输入';
  switch (_type) {
    case 'select':
      if (itemProps.mode === 'multiple') {
        specialConfig.valuePropType = 'array';
      }
      ItemComp = (
        <Select {...itemProps} size={size}>
          {
            typeof options === 'function'
              ? options()
              : options.map(single => <Option key={single.value} value={`${single.value}`}>{single.name}</Option>)
          }
        </Select>
      );
      action = '选择';
      break;
    case 'inputNumber':
      ItemComp = (
        <InputNumber {...itemProps} size={size} />
      );
      break;
    case 'textArea':
      ItemComp = (
        <TextArea {...itemProps} className={itemProps.className} />
      );
      break;
    case 'switch':
      specialConfig.valuePropName = 'checked';
      specialConfig.valuePropType = 'boolean';
      ItemComp = (
        <Switch {...itemProps} />
      );
      action = '选择';
      break;
    case 'radioGroup':
      ItemComp = (
        <Radio.Group buttonStyle="solid" {...itemProps} size={size}>
          {
            typeof options === 'function'
              ? options()
              : options.map(single => <Radio.Button key={single.value} value={`${single.value}`}>{single.name}</Radio.Button>)
          }
        </Radio.Group>
      );
      action = '选择';
      break;
    case 'checkbox':
      specialConfig.valuePropName = 'checked';
      specialConfig.valuePropType = 'boolean';
      if (itemProps.options) {
        ItemComp = (
          <Checkbox.Group {...itemProps} />
        );
      } else {
        const { text = '', ...checkboxProps } = itemProps;
        ItemComp = (
          <Checkbox {...checkboxProps}>{text}</Checkbox>
        );
      }
      action = '选择';
      break;
    case 'custom':
      ItemComp = (getComp as Function)({ form });
      break;
    case 'input':
    default:
      ItemComp = (
        <Input {...itemProps} size={size} />
      );
      break;
  }

  const layout = label === undefined
    ? fullWrapperCol
    : isTailLayout
      ? tailFormItemLayout || defalutTailFormItemLayout
      : formLayout === 'horizontal' ? formItemLayout || defalutFormItemLayout : null;

  // generate rules
  if (required && !rules.some(r => r.required === true)) {
    if (typeof label === 'string' && label.length) {
      const hasColon = !noColon && (label.endsWith(':') || label.endsWith('：'));
      rules.push({ required, message: `请${action}${hasColon ? label.slice(0, label.length - 1) : label}` });
    }
  }
  if (pattern && !rules.some(r => r.pattern && r.pattern.source === pattern.source)) {
    rules.push({ pattern, message });
  }
  // generate config
  const itemConfig = {
    rules,
    ...specialConfig,
    ...config,
  };
  if (initialValue !== null) {
    switch (itemConfig.valuePropType) {
      case 'boolean':
        itemConfig.initialValue = !!initialValue;
        break;
      case 'array':
        itemConfig.initialValue = initialValue;
        break;
      default:
        itemConfig.initialValue = initialValue.toString();
    }
  }
  return (
    <FormItem label={label} {...layout} className={itemProps.type === 'hidden' ? 'hide' : ''} {...extraProps}>
      {
        name ? (form && form.getFieldDecorator(name, itemConfig)(ItemComp)) : ItemComp
      }
      {suffix}
    </FormItem>
  );
};