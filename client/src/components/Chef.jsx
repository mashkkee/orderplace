import React, { useEffect, Suspense, useRef, useState } from 'react'
import * as rdd from 'react-device-detect';
import { getCurrentBrowserFingerPrint } from "@rajesh896/broprint.js";
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, CameraControls } from '@react-three/drei'
import Model from './Model.jsx'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';
import '../App.css'
import Modal from './Modal.jsx';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './AuthContext.jsx';
function Admin() {
    const { token } = useAuth()
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
            <Canvas  shadows style={{ height: "100vh", width: "100%" }}>
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
                <Environment files={'../../public/bush_restaurant_4k.hdr'} background blur={0.3} />
                <directionalLight position={[1, 1, 0]} />
                <gridHelper />

                <Suspense fallback={null}>
                    <Model controls={controlsRef} onMeshClick={handleClick} exited={modal} />
                </Suspense>


            </Canvas>
            {
                showModal && <Modal restaurant={jwtDecode(token).userRestaurant} table={table} exit={modalClosed} />
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