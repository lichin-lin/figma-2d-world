export interface IPropsElementData {
  width: number;
  height: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface IPropsElement {
  id: string;
  data: IPropsElementData;
}
