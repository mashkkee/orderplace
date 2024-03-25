const express = require("express");
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://192.168.1.3:5173', 'http://178.223.161.252:5173', 'http://192.168.12.210:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'orderplace_new',
    connectionLimit: 100,
});

app.use(bodyParser.json());
app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.1.3:5173', 'http://178.223.161.252:5173', 'http://192.168.12.210:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

function verifyToken(req, res, next) {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token is missing' });
    }

    let newToken = token.slice(7); // Remove "Bearer " from the token
    jwt.verify(newToken, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
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
    res.send('Owner page');
});

app.get('/api/menu/:restaurantName', async (req, res) => {
    let restaurant = req.params.restaurantName;
    try {
        const [results, fields] = await pool.promise().query('SELECT * from menu WHERE restaurant = ?', restaurant);
        if (results && results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'No Menu for this restaurant' });
        }
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/verify', verifyToken, (req, res) => {
    res.json({ status: 'success' });
});

app.get('/api/:restaurantName/model', (req, res) => {
    let file = path.join(__dirname, `restaurant_models/${req.params.restaurantName}/model.gltf`);
    res.sendFile(file);
});

app.post('/api/order/:restaurant/:table', async (req, res) => {
    let data = req.body;
    try {
        await pool.promise().query('INSERT INTO orders (items, restaurant, tableNum, time) VALUES (?, ? ,? ,?)', [JSON.stringify(data.order.itemsToOrder), data.restaurant, data.table, data.date]);
        res.status(201).json({ message: 'Order placed successfully' });
        io.emit(`newOrder-${data.restaurant}`, data.table);
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/cashout/:restaurant/:table', async (req, res) => {
    let { restaurant, table } = req.params;
    try {
        await pool.promise().query("DELETE FROM orders WHERE orders.restaurant = ? AND orders.tableNum = ?", [restaurant, table]);
        io.emit(`removeOrder-${restaurant}`, table);
        res.status(200).json({ message: 'Order removed successfully' });
    } catch (error) {
        console.error('Error removing order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/getorders/:restaurant/:table', async (req, res) => {
    let { restaurant, table } = req.params;
    try {
        const [results, fields] = await pool.promise().query("SELECT items FROM orders WHERE restaurant = ? AND tableNum = ?", [restaurant, table]);
        if (results && results.length > 0) {
            res.json(results);
        } else {
            console.log("No results");
            res.status(404).json({ message: 'No orders found' });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/auth/', async (req, res) => {
    const sql = "SELECT * FROM authentication WHERE user_password = ? AND user_role = ? AND user_restaurant = ?";
    let pwd = req.body.password;
    let role = req.body.email.split('@')[0];
    let restaurant = req.body.email.split("@")[1];
    try {
        const [results, fields] = await pool.promise().query(sql, [pwd, role, restaurant]);
        if (results && results.length > 0) {
            let token = generateToken(results[0].user_restaurant, results[0].user_role);
            res.json({ message: 'success', token: token });
        } else {
            res.status(404).json({ message: 'Invalid Credentials. Please try again.' });
        }
    } catch (error) {
        console.error('Error with authentication:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

io.on('connection', (socket) => {
    socket.on('orderPlaced', data => {
        console.log("Did it");
        io.emit(`
        newOrder-${data.restaurant}`, data.table);
    });
});

setInterval(() => {
    pool.query('SELECT 1', (error, results, fields) => {
        if (error) {
            console.log('Error in database connection:', error);
        }
    });
}, 10000);

server.listen(5000, () => {
    console.log('listening on *:5000');
});
