/* 单图操作工具栏
 * @Author: licao
 * @Date: 2020-12-04 17:57:36
 * @Last Modified by: licao
 * @Last Modified time: 2021-01-26 15:45:36
 */

import React, { memo, ReactNode, RefObject, useCallback, useEffect, useMemo } from 'react';
import { Dropdown, Menu, message, Modal } from 'antd';
import { get } from 'lodash';
import { useFullscreen, useToggle } from 'react-use';
import { getConfig } from 'src/config';
import { DcIcon } from 'src/common';
import { insertWhen } from 'src/common/utils';
import { saveImage } from 'src/utils/comp';
import ChartEditorStore from 'src/stores/chart-editor';
import DashboardStore from 'src/stores/dash-board';
// DcDashboard 里面发起的请求,需要提供配置
import { exportChartData } from 'src/services/chart-editor';

import './index.scss';

const { Item: MenuItem } = Menu;

// 临时：匹配不同格式指标名
const metricRegA = /metrics\/(.*)+\//;
const metricRegB = /metrics\/(.*)+/;

interface IProps {
  viewId: string;
  viewRef: RefObject<Element>;
  view: any;
  disabled?: boolean;
  children: ReactNode;
  toggleFullscreen: (v: boolean) => void;
}

const Options = ({ view, viewId, viewRef, children, disabled = false, toggleFullscreen }: IProps) => {
  const textMap = DashboardStore.getState((s) => s.textMap);
  const [isEditMode] = ChartEditorStore.useStore((s) => [s.isEditMode]);
  const { deleteView } = ChartEditorStore;

  const [_isFullscreen, _toggleFullscreen] = useToggle(false);
  const [isExportingData, toggleExportingDataStatus] = useToggle(false);
  const isFullscreen = useFullscreen(viewRef, _isFullscreen, { onClose: () => _toggleFullscreen() });

  useEffect(() => {
    toggleFullscreen(isFullscreen);
  }, [isFullscreen, toggleFullscreen]);

  const handleRemoveItem = useCallback(() => {
    Modal.confirm({
      content: `${textMap['confirm to remove']} ${view.title}?`,
      okText: textMap.delete,
      cancelText: textMap.Cancel,
      onOk() {
        deleteView(viewId);
      },
    });
  }, [deleteView, textMap, view.title, viewId]);

  const handleSaveImg = useCallback(() => {
    saveImage(viewRef.current, view.title || textMap['unnamed dashboard']);
  }, [textMap, view.title, viewRef]);

  const handleExportData = useCallback(() => {
    // 如果正在导出
    if (isExportingData) return;
    // 临时：从请求里面取参数。配置化 todo
    let metricName;
    const url = get(view, ['api', 'url']);
    const query = get(view, ['api', 'query']);
    // 老版数据取指标名
    metricName = (metricRegA.exec(url) || metricRegB.exec(url) || [])[1];
    // 新版数据取指标名
    if (!metricName) {
      metricName = get(view, ['api', 'body', 'from', 0]);
    }

    const { scope, scopeId } = getConfig('diceDataConfigProps');
    const _query = {
      start: query.start,
      end: query.end,
      scope,
      scopeId,
      ql: 'influxql:ast',
    };
    const payload = {
      select: [{ expr: '*' }],
      from: [metricName || ''],
      limit: 1,
    };

    if (metricName) {
      const _exportingData = message.loading(textMap['exporting data'], 0);
      toggleExportingDataStatus();
      exportChartData(metricName, _query, payload)
        .then((res: Blob) => {
          const blob = new Blob([res]);
          const fileName = `${view.title}.xlsx`;
          const downloadElement = document.createElement('a');

          downloadElement.download = fileName;
          downloadElement.style.display = 'none';
          downloadElement.href = URL.createObjectURL(blob);
          document.body.appendChild(downloadElement);
          downloadElement.click();
          URL.revokeObjectURL(downloadElement.href);
          document.body.removeChild(downloadElement);
          _exportingData();
          toggleExportingDataStatus();
        })
        .catch(() => {
          message.error(textMap['export data error']);
          _exportingData();
          toggleExportingDataStatus();
        });
    }
  }, [isExportingData, view, textMap, toggleExportingDataStatus]);

  const options: DC_BOARD_HEADER.Tool[] = useMemo(
    () => [
      {
        icon: 'fullscreen',
        text: textMap['Full screen'],
        onClick: () => _toggleFullscreen(),
      },
      {
        icon: 'camera',
        text: textMap.Export,
        onClick: () => handleSaveImg(),
      },
      // {
      //   icon: 'excel',
      //   text: textMap['export data'],
      //   onClick: () => handleExportData(),
      // },
      ...insertWhen<DC_BOARD_HEADER.Tool>(isEditMode, [
        {
          icon: 'delete',
          text: textMap['Remove charts'],
          onClick: () => handleRemoveItem(),
        },
      ]),
    ],
    [textMap, isEditMode, _toggleFullscreen, handleSaveImg, handleRemoveItem],
  );

  return (
    <Dropdown
      disabled={disabled}
      trigger={['click']}
      overlay={
        <Menu>
          {options.map((option) => (
            <MenuItem key={option.icon}>
              <a className="dc-chart-title-dp-op" onClick={option.onClick}>
                <DcIcon type={option.icon} />
                {option.text}
              </a>
            </MenuItem>
          ))}
        </Menu>
      }
    >
      {children}
    </Dropdown>
  );
};

export default memo(Options);
