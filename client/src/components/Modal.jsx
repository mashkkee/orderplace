import React, { useEffect } from 'react'
import styles from '../assets/css/modal.module.css'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext';


function Modal({ table, exit, restaurant }) {
    const [orders, setOrders] = useState([]);
    const {setPrihvaceniStolovi, prihvaceniStolovi} = useAuth()
    axios.defaults.withCredentials = true;
    useEffect(() => {
        async function getOrders() {
            await axios.get(`http://${window.location.hostname}:5000/api/getorders/${restaurant}/${table}`).then(res => {
                return setOrders(res.data)
            })
        }
        getOrders()

    }, [])
    async function cashout() {
        await axios.post(`http://${window.location.hostname}:5000/api/cashout/${restaurant}/${table}`);
        setPrihvaceniStolovi(prev => prev.filter(item => item !== table));
    }

    function prihvatiPorudzbinu(){
        setPrihvaceniStolovi((prev)=> ([...prev,table]));

    }

    return (
        <div className={styles.modal__bg}>
            <div className={styles.modal}>
                <button className={styles.exit} onClick={exit}>Close</button>
                <div className={`${styles.tableMenu} `}>

                    {
                        orders && orders.map(order => {
                            const items = JSON.parse(order.items);
                            return items.map((item, index) => (
                                <>
                                    <div key={index} className={`${styles.div1}`}>
                                        <h1>{item.name}</h1>
                                        <img className={`${styles.menuImage}`} src={item.image} alt="" />
                                        <p>{item.quantity}x</p>
                                        <p>{item.price * item.quantity}DIN</p>
                                        <p className={`${styles.napomena}`}>{
                                            item.napomena && `Napomena: ${item.napomena}`
                                        }</p>
                                        
                                    </div>
                                </>

                            ));
                        })

                    }
                    {

                        prihvaceniStolovi.includes(table) ? orders.length != 0 && <button className={styles.naplata} onDoubleClick={() => {
                            cashout();
                            exit();
                        }}>Naplati</button>
                        : orders.length != 0 && <button onClick={prihvatiPorudzbinu} className={styles.naplata}>Prihvati porudzbinu</button>
                    }
                </div>
            </div>
        </div>
    )
}

export default Modal