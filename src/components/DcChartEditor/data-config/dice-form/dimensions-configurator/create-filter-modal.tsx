import * as React from 'react';
import { isUndefined, map } from 'lodash';
import { Input, InputNumber, Select, Switch } from 'antd';
import { DcFormModal } from 'src/common';
import DashboardStore from 'src/stores/dash-board';

const { Group: InputGroup } = Input;

interface IProps {
  defaultValue: DICE_DATA_CONFIGURATOR.Dimension;
  visible: boolean;
  metricsMap: Record<string, any>;
  typeMap: Record<string, any>;
  onCancel: ((e: React.MouseEvent<any, MouseEvent>) => void) | undefined;
  onOk: (v: any) => void;
}

interface IFilterInputProps {
  value: any;
  onChange: (v: any) => void;
  fieldType: DICE_DATA_CONFIGURATOR.FieldType;
  options: ComponentOptions;
}

const FilterInput = ({ value, onChange, fieldType, options }: IFilterInputProps) => (
  <InputGroup compact size="small">
    <Select
      style={{ minWidth: 120, maxWidth: 320 }}
      allowClear
      value={value?.operation}
      size="small"
      options={options}
      onChange={(v) => onChange({ ...value, operation: v })}
    />
    <Choose>
      <When condition={fieldType === 'number'}>
        <InputNumber value={value?.value} size="small" onChange={(v) => onChange({ ...value, value: v })} />
      </When>
      <When condition={fieldType === 'string'}>
        <Input
          style={{ width: 160 }}
          value={value?.value}
          size="small"
          onChange={(e: React.FocusEvent<HTMLInputElement>) => onChange({ ...value, value: e.target.value })}
        />
      </When>
      <When condition={fieldType === 'bool'}>
        <Switch defaultChecked={value?.value || false} onChange={(v) => onChange({ ...value, value: v })} />
      </When>
    </Choose>
  </InputGroup>
);

const CreateFilterModal = ({ defaultValue, metricsMap, typeMap, ...rest }: IProps) => {
  const textMap = DashboardStore.getState((s) => s.textMap);
  const { field } = defaultValue;
  const fieldType = metricsMap[field as string]?.type;
  const options = map(typeMap[fieldType]?.filters, (v) => ({ value: v.operation, label: v.name }));
  const fields = [
    {
      label: textMap['metric filter'],
      type: FilterInput,
      name: 'filter',
      initialValue: defaultValue.filter,
      validator: [
        {
          validator: (_: any, value: { operation?: string; value?: any }) => {
            if (value?.operation && !isUndefined(value?.value)) {
              return true;
            }
            return false;
          },
        },
      ],
      customProps: {
        fieldType,
        options,
      },
    },
  ];

  return <DcFormModal title={`${textMap['filter config']}-${defaultValue.alias}`} fields={fields} {...rest} />;
};

export default CreateFilterModal;
