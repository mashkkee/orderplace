import React, { useEffect, Suspense, useRef, useState } from 'react'
import * as rdd from 'react-device-detect';
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js";
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
    const [fingerprint, setFingerPrint] = useState("")
    const controlsRef = useRef()
    useEffect(() => {
        getCurrentBrowserFingerPrint().then(fprint => {
            setFingerPrint(fprint)
        })
    
    }, [])
    const handleLogout = () => {
        localStorage.removeItem('token');
        location.reload()
    }
    const modalClosed = () => {
        setModal(true)
        setShowModal(false)
        setTimeout(() => {
            setModal(false)
        }, 100);
    }
    const handleClick = (event) => {
        setShowModal(true)
        setTable(event.object.name)
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
            {
                <input type="button" value="Logout" onClick={handleLogout} />
            }
            {
                localStorage.setItem('fingerprint', fingerprint)
            }
        </>
    )

}

export default Admin