const axios = require("axios").default;
const { MongoClient } = require("mongodb");
const express = require("express");
const ObjectId = require("mongodb").ObjectId;
// const {ObjectId} = require('bson')
const cors = require("cors");
const app = express();
const port = process.env.Port || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3raz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("FoodCart");
    const usersCollection = database.collection("users");
    // GET API
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await usersCollection.findOne(query);
      console.log("load user with id:", id);
      res.send(user);
    });

    // POST api
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      console.log("hitting the Post", req.body);
      console.log("added user", result);

      res.json(result);
    });

    // UPDATE API

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedUser.name,
          price: updatedUser.price,
          quantity: updatedUser.quantity,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating user", req);
      res.json(result);
    });

    // Delete api
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      console.log("deleting user with id", result);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running my CRUD SERVER");
});

app.listen(port, () => {
  console.log("Running Server on Port", port);
});
