const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
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
    const collection = client.db(`${process.env.DB_NAME}`).collection("devices");
    console.log('SUCCESSFULLY DONE');
    const offerCollection = client.db(`${process.env.DB_NAME}`).collection("offerProducts");
    app.post('/addOffer',(req,res) =>{

        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const offer = req.body.offer;
        const size = req.body.size;
         const category = req.body.category;
         const type = req.body.type;
         const quantity = req.body.quantity;
        const newImg=file.data;
        const encImg = newImg.toString('base64')
        
        var image ={
            contentType:file.mimetype,
            size:file.size,
            img:Buffer.from(encImg,'base64')
        };

        offerCollection.insertOne({title,description,price,offer,size,category,type,quantity,image})
        .then(result=>{   
            res.send(result.insertCount>0);
        })
    })









    app.get('/', (req, res) => {
        res.send('Hello Mysterious!')
    });
});

app.listen(process.env.PORT || port);