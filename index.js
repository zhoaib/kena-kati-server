const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m5zl65y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const brandsCollection = client.db('kenakati').collection('brands');
        const productsCollection = client.db('kenakati').collection('products');
        const bookingsCollection = client.db('kenakati').collection('bookings');
        const usersCollection = client.db('kenakati').collection('users');

        app.get('/brands', async (req, res) => {
            const query = {};
            const options = await brandsCollection.find(query).toArray();
            res.send(options);
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: (id) };
            const product = await productsCollection.find(query).toArray();
            res.send(product);
        });

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            console.log('token', req.headers.authorization);
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('kena-kati server is running')
})


app.listen(port, () => console.log(`kena=kati running on port ${port}`))