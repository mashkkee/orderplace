const express = require("express");
const app = express();
const mysql = require('mysql2');
const cors = require('cors')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const bodyPares = require('body-parser');
const bodyParser = require("body-parser");
const path = require('path');


const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'orderplace_new',
    connectionLimit: 10,
});

app.use(bodyParser.json())
app.use(express.json())



app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.1.3:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));


function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
}

function generateToken(userRest, userRole) {
    const payload = {
        userRestaurant: userRest,
        userRole: userRole,
    };

    const options = {
        expiresIn: '1h',
    };

    return jwt.sign(payload, 'your-secret-key', options);
}

app.get('/chef', verifyToken, (req, res) => {
    // If the token is valid, the user is authenticated
    res.json({ message: 'Access granted to Chef route' });
});

app.get('/owner', verifyToken, (req, res) => {
    res.send('Owner page')
});

app.get('/api/:restaurantName/model', (req, res) => {
    let file = path.join(__dirname, `restaurant_models/${req.params.restaurantName}/model.gltf`)
    res.sendFile(file)
})

// app.get('/api/:restaurantName/oredrs', (req, res) => {
//     const sql = "SELECT * FROM orders WHERE restaurant_name = ? AND table_id = ?";
//     let restaurantName = req.body.restaurant_name
//     let tableID = req.body.table_id
//     connection.query(sql, [restaurantName, tableID], (error, results, fields) => {
//         if (error) { res.send({ message: 'There was a problem with fetching orders' }) }
//         if (results && results.length > 0) {
//             let orders = {}
//             results.map(order => {
//                 orders = (prev) => {
//                     return [...prev, order]
//                 }
//             })
//             res.json({ orders: orders })

//         }
//     })

// })

app.post('/api/auth/', (req, res) => {
    const sql = "SELECT * FROM authentication WHERE user_password = ? AND user_role = ? AND user_restaurant = ?";
    let pwd = req.body.password;
    let role = req.body.email.split('@')[0]
    let restaurant = req.body.email.split("@")[1]
    connection.query(sql, [pwd, role, restaurant], (error, results, fields) => {
        if (error) { res.send({ message: 'There was a problem with an authentication. Please contact administrator' }) }
        if (results && results.length > 0) {
            let token = generateToken(results[0].user_restaurant, results[0].user_role)
            res.json({ message: 'sucsess', token: token })
            console.log("test")
        } else {
            res.status(404).json({ message: 'Invalid Credentials. Please try again.' })
            console.log("test")

        }
    })
})







app.listen(5000, () => {
    console.log("Listening on port 5000")
})
