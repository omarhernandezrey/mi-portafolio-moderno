declare module 'meshline' {
  import { Material, BufferGeometry } from 'three';

  export class MeshLineGeometry extends BufferGeometry {
    constructor();
    setPoints(points: any[]): void;
  }

  export class MeshLineMaterial extends Material {
    constructor(parameters?: {
      lineWidth?: number;
      color?: string;
      useMap?: boolean;
      resolution?: [number, number];
      repeat?: [number, number];
      depthTest?: boolean;
      map?: any;
    });
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
} 