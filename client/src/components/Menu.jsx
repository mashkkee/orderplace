import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../assets/css/menu.module.css';
import axios from 'axios';
import { socket } from './socket/socket';
import QrReader from 'react-web-qr-reader';

function Menu() {
    const params = useParams();
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verify, setVerify] = useState(false)
    const [moreInfo, setMoreInfo] = useState(false)
    const [information, setInformation] = useState([])
    const [napomena, setNapomena] = useState("")
    axios.defaults.withCredentials = true;

    useEffect(() => {
        async function fetchMenu() {
            try {
                const res = await axios.get(`http://${window.location.hostname}:5000/api/menu/${params.restaurant}/`);
                setDatas(res.data.map(item => ({ ...item, quantity: 0 })));
            } catch (error) {
                console.error('Error fetching menu:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMenu();
    }, [params.restaurant]);

    const memoizedDatas = useMemo(() => datas, [datas]);

    const addQuantity = (index) => {
        setDatas((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], quantity: newData[index].quantity + 1 };
            return newData;
        });
    };
    const previewStyle = {
        height: 240,
        width: 320,
    };
    const removeQuantity = (index) => {
        setDatas((prevData) => {
            const newData = [...prevData];
            if (newData[index].quantity > 0) {
                newData[index] = { ...newData[index], quantity: newData[index].quantity - 1 };
            }
            return newData;
        });
    };

    const handleScan = (result) => {
        if (result.data == window.location.href) {
            setVerify(true)
        } else {
            console.log("Please scan correct qr code.")
        }
    }
    const handleItemClick = (item) => {
        setMoreInfo(true)
        setInformation(item)
    }

    const handleNapomena = (index) => {
        setDatas((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], napomena: napomena };
            return newData;
        });
        setNapomena('')
        setMoreInfo(false)
    }
    const handleOrder = async () => {
        const itemsToOrder = memoizedDatas.filter((data) => data.quantity > 0);

        if (itemsToOrder.length > 0) {
            try {
                let date = new Date()
                await axios.post(`http://${window.location.hostname}:5000/api/order/${params.restaurant}/${params.table}`, {
                    order: {
                        itemsToOrder,
                    },
                    date: date,
                    table: params.table,
                    restaurant: params.restaurant,
                });

                socket.emit('orderPlaced', { restaurant: params.restaurant, table: params.table });
            } catch (error) {
                console.error('Error while placing order:', error);
            }
        } else {
            console.log('No items selected for order');
        }
    };

    return (
        <>
            {
                // verify ? (
                loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className={`${styles.menu__container}`}>
                        <ul className={`${styles.menu}`}>
                            {
                                memoizedDatas.length !== 0 &&
                                memoizedDatas.map((data, index) => (
                                    <li key={index} className={`${styles.menu__item}`}>
                                        <img
                                            src={data.image}
                                            alt={`Image of ${data.name}`}
                                            className={`${styles.menu__item__image}`}
                                        />
                                        <div className={`${styles.menu__information}`} onClick={() => handleItemClick(data)}>
                                            <h3 className={`${styles.menu__item__name}`}>{data.name}</h3>
                                            <p className={`${styles.menu__item__info}`}>Kliknite ovde za vise informacija</p>
                                            <p className={`${styles.menu__item__price}`}>{data.price} RSD</p>
                                        </div>

                                        <div className={`${styles.order__item}`}>
                                            <button onClick={() => removeQuantity(index)}>-</button>
                                            <p className={`${styles.item__count}`}>{data.quantity}</p>
                                            <button onClick={() => addQuantity(index)}>+</button>
                                        </div>




                                    </li>
                                ))

                            }
                            {
                                moreInfo && <div className={`${styles.more__info}`}>
                                    <div className={`${styles.more__info__container}`}>
                                        <p className={`${styles.more__info__close}`} onClick={() => setMoreInfo(false)}>X</p>
                                        <p className={`${styles.more__info__description}`}>{information.description}</p>
                                        <textarea placeholder='Ukoliko zelite mozete napisati napomenu za ovo jelo ovde.' className={`${styles.more__info__napomena}`} onChange={(e) => setNapomena(e.target.value)} value={napomena} name="" id="" cols="30" rows="10"></textarea>
                                        <button onClick={() => handleNapomena(datas.findIndex(item => item.description === information.description))}>Sacuvaj</button>
                                    </div>
                                </div>
                            }
                        </ul>
                        <button onClick={handleOrder} className={`${styles.menu__item__order}`}>
                            Poruci
                        </button>
                    </div>
                )
                // ) : (
                //     <>
                //         <QrReader
                //         delay={500}
                //         style={previewStyle}
                //         onError=""
                //         onScan={handleScan}
                //         />
                //     </>
                // )
            }


        </>
    );
}

export default Menu;
