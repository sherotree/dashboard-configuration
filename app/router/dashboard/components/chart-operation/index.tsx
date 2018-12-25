import React, { ReactElement } from 'react';
import { get, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Icon, Dropdown, Menu, Popconfirm, message } from 'antd';
import classnames from 'classnames';
import agent from 'agent';
import './index.scss';

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  chartId: string
  children: ReactElement<any>
}

function getChartData(url: string) {
  return agent.get(url)
    .then((response: any) => response.body)
    .catch(() => {
      message.error('该图表接口获取数据失败,将使用mock数据显示', 3);
    });
}

class ChartOperation extends React.PureComponent<IProps> {
  state = {
    resData: {},
  };

  componentDidMount() {
    this.reloadData(this.props.url);
  }

  componentWillReceiveProps({ url }: IProps) {
    if (url !== this.props.url) {
      this.reloadData(url);
    }
  }

  reloadData = (url: string) => {
    if (!url) {
      this.setState({ resData: { isMock: true } });
      return;
    }
    getChartData(url).then((resData: any) => {
      this.setState({ resData });
    });
  }

  deleteChart = () => {
    this.props.deleteChart(this.props.chartId);
  }

  doAction = ({ key }: any) => {
    switch (key) {
      case 'edit':
        return this.props.editChart(this.props.chartId);
      default:
        break;
    }
  }

  getMenu = () => (
    <Menu onClick={this.doAction}>
      <Menu.Item key="edit">编辑</Menu.Item>
      <Menu.Item key="delete">
        <Popconfirm
          okText="确认"
          cancelText="取消"
          placement="top"
          title="是否确认删除"
          onConfirm={this.deleteChart}
        >删除</Popconfirm>
      </Menu.Item>
    </Menu>
  )

  reloadChart = () => {
    this.reloadData(this.props.url);
  }

  render() {
    const { children, isEdit, isChartEdit } = this.props;
    const child = React.Children.only(children);
    console.log('this.state.body', this.state.resData);
    return (
      <div className={classnames({ 'bi-chart-operation': true, active: isChartEdit })}>
        <div className="bi-chart-operation-header">
          <Icon type="reload" onClick={this.reloadChart} />
          {isEdit && (
            <Dropdown overlay={this.getMenu()}>
              <Icon type="dash" />
            </Dropdown>
          )}
        </div>
        {!isEmpty(this.state.resData) && React.cloneElement(child, { ...child.props, ...this.state.resData })}
      </div>
    );
  }
}

const mapStateToProps = ({
  biDashBoard: { isEdit, drawerInfoMap },
  biDrawer: { editChartId } }: any, { chartId }: any) => ({
    isEdit,
    isChartEdit: editChartId === chartId,
    url: get(drawerInfoMap, [chartId, 'panneldata#url']) as any,
  });

const mapDispatchToProps = (dispatch: any) => ({
  editChart(chartId: string) {
    dispatch({ type: 'biDrawer/editChart', chartId });
  },
  deleteChart(chartId: string) {
    dispatch({ type: 'biDashBoard/deleteChart', chartId });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ChartOperation);
