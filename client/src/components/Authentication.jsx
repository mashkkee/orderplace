import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import styles from '../assets/css/authentication.module.css'
import axios from 'axios'
import Chef from './Chef'
import { useAuth } from './AuthContext';

function Authentication() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [authData, setAuthData] = useState({
        email: "",
        password: ""
    })

    function handleSubmit(e) {
        e.preventDefault()
        axios.post('http://192.168.1.3:5000/api/auth/',
            authData
        ).then(response => {
            if (response.data.message === "sucsess" && response.data.token) {
                login(response.data.token)
                location.reload()
            } 
            
        })
    }
    return (
        <>
            <div className={styles.auth}>
                <form onSubmit={handleSubmit} className={styles.auth__container}>
                    <h3>Auth</h3>
                    <input type="email" name="" placeholder='User' id="" onChange={(e) => { setAuthData(prev => ({ ...prev, ...{ email: e.target.value } })) }} />
                    <input type="password" name="" placeholder='Password' id="" onChange={(e) => { setAuthData(prev => ({ ...prev, ...{ password: e.target.value } })) }} />
                    <input type="submit" value="Login" />
                </form>
            </div>
        </>
    )
}

export default Authentication