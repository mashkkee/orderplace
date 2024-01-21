import React, { useEffect, Suspense, useRef, useState } from 'react'

import { Canvas, useLoader, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Environment, CameraControls } from '@react-three/drei'
import Model from './Model.jsx'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';
import '../App.css'
import Modal from './Modal.jsx';

function Admin() {
    const [showModal, setShowModal] = useState(false)
    const [table, setTable] = useState(null)
    const [modal, setModal] = useState(false)
    const controlsRef = useRef()

    const modalClosed = () => {
        setModal(true)
        setShowModal(false)
        setTimeout(() => {
            setModal(false)
        }, 100);
    }
    const handleClick = (event) => {
        setShowModal(true)
    }
    return (
        <>
            <Canvas style={{ height: "100vh", width: "100%", backgroundColor: "black" }}>
                <OrbitControls
                 ref={controlsRef} 
                 mouseButtons={
                    {
                        LEFT: 2,
                        RIGHT: 0,
                        MIDDLE: 1,
                    }
                 }
                 maxZoom={Math.PI / 2}
                 />
                <ambientLight intensity={1.3} color="white" />
                <Suspense fallback={null}>
                    <Model controls={controlsRef} onMeshClick={handleClick} exited={modal} />
                </Suspense>


            </Canvas>
            {
                showModal && <Modal table={table} exit={modalClosed} />
            }
        </>
    )

}

export default Admin