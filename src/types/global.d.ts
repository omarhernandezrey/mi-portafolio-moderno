/* ───────── Recursos estáticos ───────── */
declare module "*.glb";
declare module "*.gltf";
declare module "*.png";

/* ───────── meshline ───────── */
declare module "meshline" {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

/* ───────── Declarar elementos JSX personalizados ───────── */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}
export {};
