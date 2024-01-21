import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { MeshStandardMaterial, Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { useAuth } from './AuthContext.jsx';
import { jwtDecode } from 'jwt-decode'


const Model = (props) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(null);
  const { token } = useAuth();
  const [restaurant, setRestaurant] = useState("")

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken) {
        setRestaurant(decodedToken.userRestaurant)
      }
    }
  }, [token])




  const handlePointerOver = (event) => {
    setHovered(event.object);
    const highlightMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      emissiveIntensity: 0.1,
    });
    event.object.material = highlightMaterial;
  };


  const { nodes, materials } = restaurant != "" ? useGLTF(`http://localhost:5000/api/${restaurant}/model`) || false : false;



  const handlePointerOut = (event) => {
    if (hovered) {
      hovered.material = materials.restaurant;
      setHovered(null);
    }
    event.object.material = materials.restaurant;
  };


  function handleClick(object) {
    let obj =object.replaceAll("table00", "").replaceAll('table0', '');
    console.log(obj)
  }
  return (
    restaurant != "" ?
      <group ref={groupRef} {...props}>
        {
          Object.keys(nodes).map((nodeName, index) => {
            return <mesh
              key={index}
              geometry={nodes[nodeName].geometry}
              material={materials.restaurant}
              position={nodes[nodeName].position}
              scale={nodes[nodeName].scale}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
              onClick={() => {handleClick(nodeName)}}
            >
              {
                nodeName != "Scene" && nodeName != "Empty" ?
                  <Html position={[0, 1.3, 0]}>
                    <p style={{ userSelect: "none", pointerEvents: "none", transform: "translate(-50%, -50%)", color: 'white', fontWeight: "500", textAlign: 'center', fontFamily: "sans-serif" }}>Sto {nodeName.replaceAll("table00", "").replaceAll('table0', '')}</p>
                  </Html>
                  : ""
              }
            </mesh>
          }

          )

        }


      </group>
      : false
  );
};

export default Model;
