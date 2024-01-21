import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text, Html, CameraControls } from '@react-three/drei';
import { useAuth } from './AuthContext'
import { jwtDecode } from 'jwt-decode'
import { Vector3 } from 'three';
import * as THREE from 'three'

// ... (other imports)

const HighlightableMesh = ({ name, geometry, material, position, scale, rotation, onMeshClick, onDoubleClick, handleClick, controls, exited }) => {
  const mesh = useRef();
  const ref = useRef();
  const [hovered, setHover] = useState(false);
  const [backToPos, setBackToPos] = useState(false);
  const textRef = useRef();
  const { camera } = useThree()
  const [move, setMove] = useState(false);
  const handlePointerOver = () => setHover(true);
  const handlePointerOut = () => setHover(false);

  const meshClicked = () => {
    setMove(true)
  }

  useFrame(() => {
    mesh.current.rotation.y = camera.rotation.z;
    if (move) {

      camera.position.lerp({ x: mesh.current.position.x, y: mesh.current.position.y + 0.45, z: mesh.current.position.z }, 0.1)
      controls.current.target.lerp(mesh.current.position, 0.1)
      if (camera.position.distanceTo(mesh.current.position) < 0.451) {
        if(exited) {
  
          setMove(false)
          setBackToPos(true)
          
        }
      }
    }
    if(backToPos) {
      camera.position.lerp({x: 0, y: 5, z: 0}, 0.1)
      if (camera.position.distanceTo({x: 0, y: 5, z: 0}) < 1) {
        setBackToPos(false)
      }

    }
    if(camera.position.y < 0) {
      camera.position.setY(0)
    }
  })

  return (
    <>
      <group>
        <mesh
          ref={mesh}
          geometry={geometry}
          material={material}
          position={position}
          scale={scale}
          onDoubleClick={(e) => {
            meshClicked();
            if (onDoubleClick) onDoubleClick(e)
          }}
          rotation={rotation}
          onPointerOver={!move ? handlePointerOver : ""}
          onPointerOut={handlePointerOut}
          anchorX="center"
          anchorY="middle"
        >
          {hovered && (
            <meshBasicMaterial attach="material" color="" transparent opacity={0.9} />
          )}
          {name !== "Scene" && name !== "Empty" ? (
            <Text
              ref={textRef}
              position={[0, 1.009, 0]}
              color="white"
              rotation={[-1.59, 0, 0]}
              fontSize={0.5}
              anchorX="center"
              anchorY="middle"
            >
              {name}
            </Text>
          ) : undefined}
        </mesh>
      </group>
    </>
  );
};

const Model = ({ onMeshClick, controls, exited }) => {
  const { token } = useAuth();
  const { nodes } = useGLTF(`http://192.168.1.3:5000/api/${jwtDecode(token).userRestaurant}/model`);
  return (
    <>
      <group>
        {Object.keys(nodes).map((nodeName, index) => (
          <HighlightableMesh
            key={index}
            name={nodeName.replaceAll('table00', "").replaceAll("table0", "")}
            geometry={nodes[nodeName].geometry}
            material={nodes[nodeName].material}
            position={nodes[nodeName].position}
            rotation={nodes[nodeName].rotation}
            scale={nodes[nodeName].scale}
            handleClick={(e) => handleClick(e)}
            controls={controls}
            exited={exited}
            onDoubleClick={onMeshClick}
            onMeshClick={() => onMeshClick(nodeName.replaceAll('table00', "").replaceAll("table0", ""))}
          />
        ))}
      </group>
    </>
  );
};

export default Model;

