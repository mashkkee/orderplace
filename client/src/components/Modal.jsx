import React from 'react'
import styles from '../assets/css/modal.module.css'

function Modal({ table, exit }) {
    return (
        <>
            <div className={styles.modal__bg}>
                <div className={styles.modal}>
                    <h2>{table}</h2>
                    <button onClick={exit}>Close</button>
                </div>
            </div>

        </>
    )
}

export default Modal