import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
// FIX: Import `ThreeElements` type to augment JSX. This resolves TypeScript errors for R3F components.
import type { ThreeElements } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Shape, Light, ModelObject } from '../types';

// FIX: Extend the global JSX namespace to include react-three-fiber's elements.
// This resolves TypeScript errors like "Property 'mesh' does not exist on type 'JSX.IntrinsicElements'".
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const textureUrlMap: Record<string, string> = {
  brick: 'https://aistudiocdn.com/3d-house-textures/brick_wall.jpg',
  wood_planks: 'https://aistudiocdn.com/3d-house-textures/wood_planks.jpg',
  white_wall: 'https://aistudiocdn.com/3d-house-textures/white_wall.jpg',
  roof_tiles: 'https://aistudiocdn.com/3d-house-textures/roof_tiles.jpg',
  glass: 'https://aistudiocdn.com/3d-house-textures/glass.png',
  grass: 'https://aistudiocdn.com/3d-house-textures/grass.jpg',
  concrete: 'https://aistudiocdn.com/3d-house-textures/concrete.jpg',
  asphalt: 'https://aistudiocdn.com/3d-house-textures/asphalt.jpg',
  tree_bark: 'https://aistudiocdn.com/3d-house-textures/tree_bark.jpg',
  tree_leaves: 'https://aistudiocdn.com/3d-house-textures/tree_leaves.jpg',
  metal: 'https://aistudiocdn.com/3d-house-textures/metal.jpg',
  water: 'https://aistudiocdn.com/3d-house-textures/water.jpg',
  default: 'https://aistudiocdn.com/3d-house-textures/default_white.jpg',
};

const TexturedShape: React.FC<{ shape: Shape }> = ({ shape }) => {
  const { size = [1, 1, 1], rotation = [0, 0, 0], material = 'default' } = shape;
  
  const url = textureUrlMap[material] || textureUrlMap.default;
  const texture = useTexture(url);

  const materialProps = useMemo(() => {
    const clonedTexture = texture.clone();
    clonedTexture.wrapS = THREE.RepeatWrapping;
    clonedTexture.wrapT = THREE.RepeatWrapping;

    const [w, h, d] = size;
    const dims = [w, h, d].sort((a, b) => b - a);
    clonedTexture.repeat.set(dims[0], dims[1]);

    clonedTexture.needsUpdate = true;

    const props: any = { map: clonedTexture };

    if (material === 'glass' || material === 'water') {
      props.transparent = true;
      props.opacity = material === 'glass' ? 0.4 : 0.75;
    }
    if (material === 'water') {
      props.metalness = 0.2;
      props.roughness = 0.1;
    }
     if (material === 'glass') {
      props.roughness = 0.1;
      props.metalness = 0.1;
    }

    return props;
  }, [texture, material, size]);

  return (
    <mesh
      position={shape.position}
      rotation={rotation as [number, number, number]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
};

const LightSource: React.FC<{ light: Light }> = ({ light }) => {
  const { color = '#ffffff', intensity = 1 } = light;
  return (
    <group position={light.position}>
      <pointLight
        color={color}
        intensity={intensity}
        distance={50}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      {/* Visual representation of the light source */}
      <mesh scale={0.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} emissive={color} />
      </mesh>
    </group>
  );
};

interface ModelViewerProps {
  modelObjects: ModelObject[];
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelObjects }) => {
  return (
    <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [20, 15, 25] }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.2} preset="rembrandt" shadows>
            <group>
              {modelObjects.map((obj, index) => {
                if (obj.type === 'box') {
                    return <TexturedShape key={index} shape={obj as Shape} />;
                }
                if (obj.type === 'light') {
                    return <LightSource key={index} light={obj as Light} />;
                }
                return null;
              })}
            </group>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault minDistance={5} maxDistance={100} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;