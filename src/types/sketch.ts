export type Tool = 'select' | 'line' | 'circle' | 'rectangle' | 'arc' | 'move';
export type ShapeType = 'line' | 'circle' | 'rectangle' | 'arc' | 'extrusion';
export type CanvasAction = 'delete-selected' | 'clear-all' | 'group' | 'pushPull' | 'offset' | 'mirror';

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface SketchShape {
  id: string;
  type: ShapeType;
  points: Point3[];
  selected: boolean;
  grouped?: string;
  meta?: {
    height?: number;
    offsetDistance?: number;
    mirroredAxis?: 'x' | 'z';
    sourceId?: string;
  };
}
