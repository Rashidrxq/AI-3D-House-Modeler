export interface Shape {
  type: 'box';
  position: [number, number, number];
  size?: [number, number, number];
  rotation?: [number, number, number];
  material?: string;
}

export interface Light {
  type: 'light';
  position: [number, number, number];
  color?: string;
  intensity?: number;
}

export type ModelObject = Shape | Light;
