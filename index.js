const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;

const fileUpload = require('express-fileupload');
const cors = require('cors');
require('dotenv').config();

const port = 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnj3g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
    const offerCollection = client.db(`${process.env.DB_NAME}`).collection("offerProducts");
    const vendorsCollection = client.db(`${process.env.DB_NAME}`).collection("vendors");
    console.log('SUCCESSFULLY DONE');


    app.post('/register', async (req, res) => {
        const { firstName, lastName, companyName, contactNumber, email, password } = req.body;
        if (!firstName || !lastName || !companyName || !contactNumber || !email || !password) {
            return res.status.json({ error: "Please filled the field properly" });
        }

        try {
            const userExist = await vendorsCollection.findOne({ email: email });

            if (userExist) {
                return res.status(422).json({ error: "Email already Exist" });
            }
            else {
                vendorsCollection.insertOne({ firstName, lastName, companyName, contactNumber, email, password })
                    .then(result => {
                        res.send(result.insertCount > 0);
                    });
                res.status(201).json({ message: "user registered successfully" });
            }
        }
        catch (err) {
            console.log(err);
        }
    })


    app.post('/addProduct', (req, res) => {

        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const size = req.body.size;
        const category = req.body.category;
        const type = req.body.type;
        const quantity = req.body.quantity;
        const newImg = file.data;
        const encImg = newImg.toString('base64')

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        productCollection.insertOne({ title, description, price, size, category, type, quantity, image })
            .then(result => {
                res.send(result.insertCount > 0);
            })
    })

    app.get('/products', (req, res) => {
        productCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/products/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        productCollection.find({ _id: id })
            .toArray((err, result) => {
                res.send(result[0]);
            })
    })


    app.get('/offerProducts', (req, res) => {
        offerCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/offerProduct/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        offerCollection.find({ _id: id })
            .toArray((err, result) => {
                res.send(result[0]);
            })
    })


    app.post('/addOffer', (req, res) => {

        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const offer = req.body.offer;
        const size = req.body.size;
        const category = req.body.category;
        const type = req.body.type;
        const quantity = req.body.quantity;
        const newImg = file.data;
        const encImg = newImg.toString('base64')

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        offerCollection.insertOne({ title, description, price, offer, size, category, type, quantity, image })
            .then(result => {
                res.send(result.insertCount > 0);
            })
    })



    app.get('/', (req, res) => {
        res.send('Hello Mysterious!')
    });
});

app.listen(process.env.PORT || port);