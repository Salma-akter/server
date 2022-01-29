const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;

// midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3x4y7.mongodb.net/Quiz_db?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Quiz_db");
    const quizCollection = database.collection("quiz");
    const usersCollection = database.collection("users");
    const adminCollection = database.collection("admin");
    const reviewCollection = database.collection("review");
    const scoreCollection = database.collection("scoreboard");

     // Add new Question
     app.post("/addQuestion", async (req, res) => {
        const newQuestion = req.body;
        const result = await quizCollection.insertOne(newQuestion);
        res.json(result);
      });
  
       // get Question by category
       app.get("/quiz", async (req, res) => {
         const category= req.query.category;
          const coursor = quizCollection.find({category:category});
          const getQuiz = await coursor.toArray();
          res.send(getQuiz);
        });

       // get All Question
       app.get("/getQuestion", async (req, res) => {
        const allQuestion = quizCollection.find({});
        const result = await allQuestion.toArray();
        res.send(result);
      });
        // delete Question
        app.delete("/deleteQuiz/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await quizCollection.deleteOne(query);
          res.json(result);
        })

        //Add scoreboard
    app.post("/score", async (req, res) => {
      const userScore = req.body;
      const result = await scoreCollection.insertOne(userScore);
      res.json(result);
    })

    //get scoreboard
    app.get("/getScore", async (req, res) => {
      const allScore = scoreCollection.find({});
      const result = await allScore.toArray();
      res.send(result);
    });

     //delete userScore
     app.delete("/deleteScore/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await scoreCollection.deleteOne(query);
      res.json(result);
    })

    // is admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
 
    // user upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
 
    // set admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // makeAdmin
    app.post("/makeAdmin", async (req, res) => {
      const admin = req.body;
      const result = await adminCollection.insertOne(admin);
      res.json(result);
    });
   //delete admin
    app.delete("/deleteAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await adminCollection.deleteOne(query);
      res.json(result);
    });


    // get Admin
    app.get("/getAdmin", async (req, res) => {
      const coursor = adminCollection.find({});
      const getAdmin = await coursor.toArray();
      res.send(getAdmin);
    });

     //add Review
     app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    
     // get Review
     app.get("/getReview", async (req, res) => {
      const review = reviewCollection.find({});
      const result = await review.toArray();
      res.send(result);
    });
    // Delete Review
    app.delete("/deleteReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.json(result);
    })

  } finally {
    //    await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("database connected");
});

app.listen(port, () => {
  console.log("Server Run On http://localhost:8000/");
});