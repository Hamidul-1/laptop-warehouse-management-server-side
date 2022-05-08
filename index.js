const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kheel.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('laptopWarehouse').collection('laptopItem');

        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await serviceCollection.findOne(query);
            res.send(item);
        });

        // POST
        app.post('/item', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        });

        // DELETE
        app.delete('/item/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });


        // delivery 
        app.put('/item/decrease/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const items = await serviceCollection.updateOne(query, {
                $inc: { quantity: -1 }

            })
            res.send(items)
        })

        // restore
        app.put('/item/increase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const quantity = parseInt(req.body.quantity);
            const item = await serviceCollection.findOne(query);
            const newQuantity = quantity + item.quantity;
            const updateQuantity = await serviceCollection.updateOne(query, {
                $set: { quantity: newQuantity }
            })
            res.send(updateQuantity);
        })

    }
    finally {

    }
}


run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Genius Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})