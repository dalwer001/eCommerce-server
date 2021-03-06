const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const ObjectID = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");
const cors = require("cors");
require("dotenv").config();

const port = 5000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnj3g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.connect((err) => {
    const productCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("products");
    const offerCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("offerProducts");
    const vendorsCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("vendors");
    const adminCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("admin");
    const reviewsCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("reviews");
    const categoryCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("category");
    const typeCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("type");
    const deliveriesCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("deliveries");

    console.log("SUCCESSFULLY DONE");

    app.post("/register", async (req, res) => {
        const { firstName, lastName, companyName, contactNumber, email, password } =
            req.body;
        if (
            !firstName ||
            !lastName ||
            !companyName ||
            !contactNumber ||
            !email ||
            !password
        ) {
            return res.status.json({ error: "Please filled the field properly" });
        }

        try {
            const userExist = await vendorsCollection.findOne({ email: email });

            if (userExist) {
                return res.status(422).json({ error: "Email already Exist" });
            } else {
                vendorsCollection
                    .insertOne({
                        firstName,
                        lastName,
                        companyName,
                        contactNumber,
                        email,
                        password,
                    })
                    .then((result) => {
                        res.send(result.insertCount > 0);
                    });
                res.status(201).json({ message: "user registered successfully" });
            }
        } catch (err) {
            console.log(err);
        }
    });

    app.post("/signIn", async (req, res) => {
        try {
            const { email, password, status } = req.body;
            if (!email || !password || !status) {
                return res
                    .status(400)
                    .json({ error: "Please Fill up the input field" });
            }

            const userLogin = await vendorsCollection.findOne({
                email: email,
                password: password,
                status: "Accepted",
            });

            //    const accessToken= jwt.sign(userLogin, process.env.ACCESS_TOKEN_SECRET);
            //    res.json({accessToken:accessToken})
            // const token = userLogin.generateAuthToken();
            if (!userLogin) {
                res.status(400).json({ error: "Invalid Credentials" });
            } else {
                res.json({ message: "User SignIn Successfully" });
            }
        } catch (err) {
            console.log(err);
        }
    });


    // get all vendor
    app.get("/vendors", (req, res) => {
        vendorsCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });


    app.get("/vendor/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        vendorsCollection.find({ _id: id }).toArray((err, result) => {
            res.send(result[0]);
        });
    });

    // accept vendor
    app.patch("/acceptVendor/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        vendorsCollection
            .updateOne(
                { _id: id },
                {
                    $set: { status: req.body.status },
                }
            )
            .then((result) => {
                res.send(result.modifiedCount > 0);
            });
    });

    // add products
    app.post("/addProduct", (req, res) => {
        const newProduct = req.body;
        productCollection.insertOne(newProduct).then((result) => {
            res.send(result.insertCount > 0);
        });
    });

    // products publish/unpublish
    app.patch("/publishProduct/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        productCollection
            .updateOne(
                { _id: id },
                {
                    $set: { status: req.body.status },
                }
            )
            .then((result) => {
                res.send(result.modifiedCount > 0);
            });
    });
    // get all products
    app.get("/products", (req, res) => {
        productCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });
    //delete products
    app.delete("/deleteProducts/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        productCollection.deleteOne({ _id: id }).then((result) => {
            res.send(result.deletedCount > 0);
        });
    });
    app.get("/product", (req, res) => {
        const email = req.query.email;
        productCollection.find({ email: email }).toArray((err, documents) => {
            res.send(documents);
        });
    });
    // get single product
    app.get("/products/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        productCollection.find({ _id: id }).toArray((err, result) => {
            res.send(result[0]);
        });
    });
    // update products
    app.get("/updateP/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        productCollection.find({ _id: id }).toArray((err, documents) => {
            res.send(documents[0]);
        });
    });

// update products
app.get('/updateP/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    productCollection.find({ _id: id })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })
  app.patch('/updateProduct/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    productCollection.updateOne({ _id: id },
      {
        $set: {
          title: req.body.title,
          price: req.body.price,
          size: req.body.size,
          category: req.body.category,
          type: req.body.type,
          quantity: req.body.quantity,
          description: req.body.description,
          image: req.body.imageURL
        }
      })
      .then(result => {
        res.send(result.modifiedCount > 0)
      })
  })
    // add offer
    app.post("/addOffer", (req, res) => {
        const newOfferProduct = req.body;

        offerCollection.insertOne(newOfferProduct).then((result) => {
            res.send(result.insertCount > 0);
        });
    });

    // get all offer
    app.get("/offerProducts", (req, res) => {
        offerCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });
    // vendor get offer
    app.get("/offerProduct", (req, res) => {
        const email = req.query.email;
        offerCollection.find({ email: email }).toArray((err, documents) => {
            res.send(documents);
        });
    });
    // get single offer
    app.get("/offerProduct/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        offerCollection.find({ _id: id }).toArray((err, result) => {
            res.send(result[0]);
        });
    });
    app.get("/updateOP/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        offerCollection.find({ _id: id }).toArray((err, documents) => {
            res.send(documents[0]);
        });
    });
    app.get('/updateOP/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        offerCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })
    app.patch('/updateOfferProduct/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        offerCollection.updateOne({ _id: id },
          {
            $set: {
              title: req.body.title,
              mainPrice: req.body.mainPrice,
              offer: req.body.offer,
              size: req.body.size,
              category: req.body.category,
              type: req.body.type,
              quantity: req.body.quantity,
              description: req.body.description,
              imageURL: req.body.imageURL,
            }
          })
          .then(result => {
            res.send(result.modifiedCount > 0)
          })
      })
    
    // offer publish/unpublish
    app.patch('/publishOfferProduct/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        offerCollection.updateOne({ _id: id },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    // add Reviews

    app.post("/addReview", (req, res) => {
        const id = req.body.id;
        const name = req.body.name;
        const email = req.body.email;
        const description = req.body.description;

        reviewsCollection
            .insertOne({ id, name, email, description })
            .then((result) => {
                res.send(result.insertCount > 0);
            });
    });
    // get all review
    app.get("/reviews", (req, res) => {
        reviewsCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    // get single reviews
    app.get("reviews/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        reviewsCollection.find({ id: id }).toArray((err, result) => {
            res.send(result[0]);
        });
    });

    // post category

    app.post("/addCategory", (req, res) => {
        const category = req.body;
        categoryCollection.insertOne(category).then((result) => {
            res.send(result.insertCount > 0);
        });
    });
    app.get("/updateCat/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        categoryCollection.find({ _id: id }).toArray((err, documents) => {
            res.send(documents[0]);
        });
    });
    app.patch("/updateCategory/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        categoryCollection
            .updateOne(
                { _id: id },
                {
                    $set: {
                        category: req.body.category,
                       
                    },
                }
            )
            .then((result) => {
                res.send(result.modifiedCount > 0);
            });
    });
    // get all category
    app.get("/categories", (req, res) => {
        categoryCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    // post type

    app.post("/addType", (req, res) => {
        const type = req.body.type;
        typeCollection.insertOne({ type }).then((result) => {
            res.send(result.insertCount > 0);
        });
    });
    // get all type
    app.get("/types", (req, res) => {
        typeCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });
    //update type
    app.get('/updateT/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        typeCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })
    app.patch('/updateType/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        typeCollection.updateOne({ _id: id },
            {
                $set: {
                    type: req.body.type,
                }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    // Delivery post
    app.post("/addDelivery", async(req, res) => {
        const delivery = req.body;

        try {
            const userExist = await deliveriesCollection.findOne({ email: delivery.email });
            if (userExist) {
                return res.status(422).json({ error: "Address already Exist" });
            }
            else {
                deliveriesCollection.insertOne(delivery)
                    .then(result => {
                        res.send(result.insertCount > 0);
                    })
                res.status(201).json({ message: "Address added successfully" });
            }
        }
        catch (err) {
            console.log(err);
        }
    });
// payment


    // Delivery get
    app.get("/delivery", (req, res) => {
        const email = req.query.email;
        deliveriesCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // add admin
    app.post("/addAdmin", (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({ email }).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });
    // get admin
    app.get("/admin", (req, res) => {
        adminCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });
    // check admin
    app.post("/isAdmin", (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email }).toArray((err, admins) => {
            res.send(admins.length > 0);
        });
    });

    app.get("/", (req, res) => {
        res.send("Hello Mysterious!");
    });
    //search api routes
    app.get("/search/:title", (req, res) => {
        var regex = new RegExp(req.params.title, "i");
        productCollection.find({ title: regex }).toArray((err, documents) => {
            res.send(documents);
        });
    });

});

app.listen(process.env.PORT || port);
