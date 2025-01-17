/* Dashboard 工具栏
 * @Author: licao
 * @Date: 2020-12-03 16:19:32
 * @Last Modified by: licao
 * @Last Modified time: 2021-03-11 14:33:40
 */
import React, { RefObject, useCallback, useEffect, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import { useFullscreen, useToggle } from 'react-use';
import { DcIcon } from 'src/common';
import { insertWhen } from 'src/common/utils';
import { saveImage } from 'src/utils/comp';
import DashboardStore from 'src/stores/dash-board';
import ChartEditorStore from 'src/stores/chart-editor';
import GlobalFiltersStore from 'src/stores/global-filters';

import './header.scss';

interface IProps {
  wrapRef: RefObject<Element>;
  contentRef: RefObject<Element>;
  dashboardName?: string;
  slot?: React.ReactNode;
  readOnly?: boolean;
  afterEdit?: () => void;
  beforeSave?: () => boolean; // 返回 false 来拦截 onSave
  onSave?: (layout: any[], extra: { singleLayouts: any[]; viewMap: any }) => void; // 保存
  onCancel?: () => void; // 取消编辑
}

const DashboardHeader = ({
  wrapRef,
  contentRef,
  dashboardName,
  readOnly,
  slot,
  afterEdit,
  beforeSave,
  onSave,
  onCancel,
}: IProps) => {
  const textMap = DashboardStore.getState((s) => s.textMap);
  // 编辑态
  const [isEditMode, viewMap] = ChartEditorStore.useStore((s) => [s.isEditMode, s.viewMap]);
  const { setEditMode, setPickChartModalVisible, addView, saveEdit, toggleFullscreen } = ChartEditorStore;
  const { toggleConfigModal } = GlobalFiltersStore;

  const [_isFullscreen, _toggleFullscreen] = useToggle(false);
  const isFullscreen = useFullscreen(wrapRef, _isFullscreen, { onClose: () => _toggleFullscreen() });

  useEffect(() => {
    toggleFullscreen(isFullscreen);
  }, [isFullscreen, toggleFullscreen]);

  const handleTriggerEditMode = useCallback(() => {
    setEditMode(true);
    afterEdit && afterEdit();
  }, [afterEdit, setEditMode]);

  const handleSaveImg = useCallback(() => {
    saveImage(contentRef.current, dashboardName || textMap['unnamed dashboard']);
  }, [contentRef, dashboardName]);

  const handleCancel = useCallback(() => {
    setEditMode(false);
    onCancel && onCancel();
  }, [onCancel, setEditMode]);

  const doSaveDashboard = useCallback(() => {
    const full: { layout?: DC.PureLayoutItem[]; viewMap: Record<string, DC.View> } = saveEdit();
    if (onSave) {
      const { layout: singleLayouts, viewMap: _viewMap } = full;
      const fullLayouts = (singleLayouts || []).map((_layout) => ({
        ..._layout,
        view: _viewMap[_layout.i],
      }));
      onSave(fullLayouts, { singleLayouts: singleLayouts || [], viewMap });
    }
  }, [onSave, saveEdit, viewMap]);

  const handleSaveDashboard = useCallback(() => {
    if (beforeSave) {
      const isContinue = beforeSave();
      if (isContinue) {
        doSaveDashboard();
      }
    } else {
      doSaveDashboard();
    }
  }, [beforeSave, doSaveDashboard]);

  const leftTools = useMemo(
    () => [
      ...insertWhen<DC_BOARD_HEADER.Tool>(!isFullscreen, [
        {
          icon: 'fullscreen',
          btnType: 'text',
          text: textMap['Full screen'],
          onClick: () => _toggleFullscreen(),
        },
      ]),
      ...insertWhen<DC_BOARD_HEADER.Tool>(isFullscreen, [
        {
          icon: 'fullscreen-exit',
          btnType: 'text',
          text: textMap['Exit fullscreen'],
          onClick: () => _toggleFullscreen(),
        },
      ]),
      ...insertWhen<DC_BOARD_HEADER.Tool>(!isEditMode && !isFullscreen, [
        {
          icon: 'camera',
          btnType: 'text',
          text: textMap.Export,
          onClick: () => handleSaveImg(),
        },
      ]),
    ],
    [isEditMode, isFullscreen, handleSaveImg, _toggleFullscreen],
  );

  const editTools = useMemo(
    () => [
      ...insertWhen<DC_BOARD_HEADER.Tool>(!isEditMode, [
        {
          icon: 'edit',
          text: textMap.Edit,
          btnType: 'primary',
          onClick: () => handleTriggerEditMode(),
        },
      ]),
      ...insertWhen<DC_BOARD_HEADER.Tool>(isEditMode, [
        {
          icon: 'plus',
          btnType: 'text',
          text: textMap['Add Chart'],
          // onClick: () => setPickChartModalVisible(true),
          onClick: () => addView(undefined),
        },
        // {
        //   icon: 'setting',
        //   customRender: () => {
        //     return (
        //       <Dropdown
        //         trigger={['click']}
        //         overlay={
        //           <Menu>
        //             <Menu.Item>
        //               <a className="dc-chart-title-dp-op" onClick={() => toggleConfigModal()}>
        //                 {textMap['global filter']}
        //               </a>
        //             </Menu.Item>
        //           </Menu>
        //         }
        //       >
        //         <Button type="text">
        //           <DcIcon type="setting" />
        //         </Button>
        //       </Dropdown>
        //     );
        //   },
        // },
        {
          icon: 'save',
          btnType: 'text',
          text: textMap.Save,
          onClick: () => handleSaveDashboard(),
        },
        {
          icon: 'close',
          btnType: 'text',
          text: textMap['exit edit mode'],
          onClick: () => handleCancel(),
        },
      ]),
    ],
    [isEditMode, handleTriggerEditMode, addView, toggleConfigModal, handleSaveDashboard, handleCancel],
  );

  const renderTools = (tools: DC_BOARD_HEADER.Tool[]) =>
    tools.map(({ text, icon, btnType, customRender, onClick }) => (
      <Choose>
        <When condition={!!customRender}>
          <React.Fragment key={icon}>{(customRender as Function)()}</React.Fragment>
        </When>
        <Otherwise>
          <Tooltip title={text} key={icon}>
            <Button type={btnType || 'default'} onClick={onClick} icon={<DcIcon type={icon} />} />
          </Tooltip>
        </Otherwise>
      </Choose>
    ));

  return (
    <>
      <div className="dc-dashboard-header flex-box">
        <div className="dc-dashboard-tools dc-dashboard-left-tools flex-box">
          {renderTools(leftTools)}
          <If condition={isFullscreen}>
            <div className="fz18">{dashboardName}</div>
          </If>
        </div>
        <div className="dc-dashboard-tools dc-dashboard-right-tools flex-box">
          {!readOnly && !isFullscreen && renderTools(editTools)}
          {slot && !isEditMode && <div className="ml12">{slot}</div>}
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
