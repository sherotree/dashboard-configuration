interface IChart {
  name: string
  icon: React.ReactNode | React.FunctionComponent // props由type组成
  Component: React.ReactNode | React.FunctionComponent // props由viewId，以及接口的返回结果组成
  Configurator: React.ReactNode | React.FunctionComponent // 配置器
  mockData?: any
  dataSettings?: any[] // props由form相关属性构成
}

export interface IChartsMap {
  [type: string]: IChart
}

export interface IExpand {
  chartType: string,
  url: string
}

type TData = number[] | string[];

export interface IMetricData {
  name: string;
  type: string;
  data: TData;
  [prop: string]: any; // 其他数据，有loadData时可能用于dataConvertor
}

export interface IStaticData {
  title: string;
  xData: TData | TData[];
  yData?: TData | TData[];
  metricData: IMetricData[];
  legendData: TData[];
  [prop: string]: any; // 其他数据，有loadData时可能用于dataConvertor
}

export type IDataConvertar = (data: object) => object;
export type IOptionFn = (data: object, optionExtra?: object) => object;

export interface IView {
  name: string;
  // 展示类型，图表或其他，界面配置时内置为chart:xxx类型; 注册了其他组件后可选择
  chartType: string; // chart:timeline | chart:bar | chart:radar ...
  hideHeader?: boolean; // 是否隐藏Header
  staticData?: IStaticData; // 静态数据
  loadData?(query?: object): Promise<any>; // 动态获取数据的方法，如果界面上配置了接口，则自动生成请求调用
  dataConvertor?: string | IDataConvertar; // 数据转换，为string时表示使用已注册的方法
  config: IViewConfig// 所有页面上的配置项
  Controls?: string[] | React.Component[]; // 控件列表，展示在header下面，为string时表示使用已注册的组件
  Configurator?: React.ReactElement<any>; // 配置器，放在配置区域显示
}

export interface IViewConfig {
  option?: string | object;// 图表配置，会作为最高优先级合并
  optionFn?: string | IOptionFn;// 图表配置方法，以标准数据为参数，为字符串表示从注册中取
  optionExtra: object; // 额外对象，用于组件直接传递参数给dataConvertor
}

export interface ILayoutItem {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  moved: boolean;
  static: boolean;
  view: IView;
}

export type ILayout = ILayoutItem[];
