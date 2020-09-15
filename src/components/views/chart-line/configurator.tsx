/**
 * 2D 线形图：折线、柱状、曲线
 */
import { set, get, cloneDeep } from 'lodash';
import { Form } from 'antd';
import React from 'react';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { insertWhen } from '../../../common/utils';
import { RenderPureForm, KVTable, useUpdate } from '../../../common';
import ChartEditorStore from '../../../stores/chart-editor';
import DashboardStore from '../../../stores/dash-board';

// tslint:disable-next-line: no-use-before-declare
interface IProps {
  viewId: string;
  isMock: boolean;
  defaultOption: object;
  currentChart: DC.View;
  form: WrappedFormUtils;
  forwardedRef: { current: any };
  setTouched: any;
  onEditorChange: any;
  isTouched: any;
}

const LineConfigurator = (props: IProps) => {
  const { form, forwardedRef, currentChart, setTouched, onEditorChange, isTouched } = props;
  const textMap = DashboardStore.useStore(s => s.textMap);
  const [{ controls }, updater] = useUpdate({ controls: form.getFieldValue('controls') });
  React.useEffect(() => {
    forwardedRef.current = form;
    if (!isTouched && form.isFieldsTouched()) {
      setTouched(true);
    }
    updater.controls(form.getFieldValue('controls'));
  }, [form, updater]);

  React.useEffect(() => {
    setTimeout(() => {
      form.setFieldsValue(currentChart);
      currentChart.controls && updater.controls(currentChart.controls);
    }, 0);
  }, [currentChart, updater]);

  const onConfigChange = (key: string, value: any) => {
    const _config = cloneDeep(currentChart.config);
    set(_config, key, value);
    onEditorChange({ config: _config });
  };

  const fields = React.useMemo(() => [
    {
      label: textMap.title,
      name: 'title',
      type: 'input',
      itemProps: {
        onBlur(e: any) {
          onEditorChange({ title: e.target.value });
        },
      },
    },
    {
      label: textMap.description,
      name: 'description',
      type: 'textArea',
      itemProps: {
        onBlur(e: any) {
          onEditorChange({ description: e.target.value });
        },
      },
    },
    {
      label: textMap.controls,
      name: 'controls[0].type',
      type: 'select',
      options: [{ name: textMap.select, value: 'select' }],
      itemProps: {
        allowClear: true,
        onSelect(v: any) {
          onEditorChange({ controls: [{
            type: v,
            key: undefined,
            options: [],
          }] });
        },
      },
    },
    ...insertWhen(controls && controls[0].type, [
      {
        label: textMap['control key'],
        name: 'controls[0].key',
        required: true,
        type: 'input',
        initialValue: controls && controls[0] && controls[0].key,
        itemProps: {
          onBlur(e: any) {
            onEditorChange({ controls: [{
              type: controls[0].type,
              key: e.target.value,
              options: [],
            }] });
          },
        },
      },
      {
        label: textMap['control data'],
        name: 'controls[0].options',
        required: true,
        type: 'custom',
        getComp: () => (
          <KVTable
            customValue={controls && controls[0] && controls[0].options}
            forwardedRef={forwardedRef}
            onChange={(values: DC.IKVTableValue[]) => {
              onEditorChange({
                controls: [{
                  type: controls[0].type,
                  key: controls[0].key,
                  options: values,
                }],
              });
            }}
          />
        ),
      },
    ]),
    // {
    //   label: '提示',
    //   subList: [
    //     [
    //       {
    //         label: 'trigger',
    //         tooltip: '触发类型',
    //         name: 'config.option.tooltip.trigger',
    //         type: 'select',
    //         options: ['item', 'axis', 'none'].map(d => ({ name: d, value: d })),
    //         itemProps: {
    //           span: 3,
    //           onSelect(v: any) {
    //             onConfigChange('option.tooltip.trigger', v);
    //           },
    //         },
    //         size: 'small',
    //       },
    //       {
    //         label: 'transitionDuration',
    //         tooltip: '提示框浮层的移动动画过渡时间，单位是 s，设置为 0 的时候会紧跟着鼠标移动。',
    //         name: 'config.option.tooltip.transitionDuration',
    //         type: 'inputNumber',
    //         itemProps: {
    //           span: 5,
    //           onChange(v: number) {
    //             onConfigChange('option.tooltip.transitionDuration', v);
    //           },
    //         },
    //         size: 'small',
    //       },
    //       {
    //         label: 'confine',
    //         tooltip: '是否将 tooltip 框限制在图表的区域内。',
    //         name: 'config.option.tooltip.confine',
    //         type: 'select',
    //         options: [{ name: 'true', value: true }, { name: 'false', value: false }],
    //         itemProps: {
    //           span: 4,
    //           onSelect(v: any) {
    //             onConfigChange('option.tooltip.confine', v);
    //           },
    //         },
    //         size: 'small',
    //       },
    //     ],
    //   ],
    // },
    // {
    //   label: '图例',
    //   subList: [
    //     [
    //       {
    //         label: 'bottom',
    //         name: 'config.option.legend.bottom',
    //         tooltip: '图例组件离容器下侧的距离。',
    //         type: 'inputNumber',
    //         itemProps: {
    //           span: 4,
    //           onChange(v: number) {
    //             onConfigChange('option.legend.bottom', v);
    //           },
    //         },
    //         size: 'small',
    //       },
    //       {
    //         label: 'orient',
    //         name: 'config.option.legend.orient',
    //         tooltip: '图例列表的布局朝向。',
    //         type: 'select',
    //         options: ['horizontal', 'vertical'].map(d => ({ name: d, value: d })),
    //         itemProps: {
    //           span: 4,
    //           onSelect(v: any) {
    //             onConfigChange('option.legend.orient', v);
    //           },
    //         },
    //         size: 'small',
    //       },
    //       {
    //         label: 'align',
    //         name: 'config.option.legend.align',
    //         type: 'select',
    //         options: ['auto', 'left', 'right'].map(d => ({ name: d, value: d })),
    //         tooltip: '图例标记和文本的对齐。默认自动，根据组件的位置和 orient 决定，当组件的 left 值为 \'right\' 以及纵向布局（orient 为 \'vertical\'）的时候为右对齐，及为 \'right\'。',
    //         itemProps: {
    //           span: 4,
    //           onSelect(v: any) {
    //             onConfigChange('option.legend.align', v);
    //           },
    //         },
    //         size: 'small',
    //       },
    //       {
    //         label: 'type',
    //         name: 'config.option.legend.type',
    //         type: 'select',
    //         options: ['plain', 'scroll'].map(d => ({ name: d, value: d })),
    //         tooltip: '图例的类型',
    //         itemProps: {
    //           span: 4,
    //           onSelect(v: any) {
    //             onConfigChange('option.legend.type', v);
    //           },
    //         },
    //         size: 'small',
    //       },
    //     ],
    //   ],
    // },
  ], [textMap, forwardedRef, controls, onEditorChange]);

  return (
    <section className="configurator-section">
      <RenderPureForm
        list={fields}
        form={form}
      />
    </section>
  );
};

const LineForm = Form.create()(LineConfigurator);

const Configurator = (p: any) => {
  const [viewMap, editChartId, isTouched] = ChartEditorStore.useStore(s => [s.viewMap, s.editChartId, s.isTouched]);

  const { setTouched, onEditorChange } = ChartEditorStore;
  const storeProps = {
    setTouched,
    onEditorChange,
    isTouched,
    currentChart: get(viewMap, [editChartId]),
  };
  return <LineForm {...p} {...storeProps} />;
};

export default React.forwardRef((props, ref) => (
  <Configurator forwardedRef={ref} {...props} />
));
