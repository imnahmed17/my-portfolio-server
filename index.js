require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('my-portfolio');
        const projectCollection = db.collection('projects');
        const skillCollection = db.collection('skills');
        const blogCollection = db.collection('blogs');

        // Get All Projects
        app.get('/projects', async (req, res) => {
            let query = {};

            if (req.query.category) {
                query.category = req.query.category;
            }

            const result = await projectCollection.find(query).toArray();
            res.json(result);
        });

        // Create A New Project
        app.post('/projects', async (req, res) => {
            const project = req.body;
            const result = await projectCollection.insertOne(project);
            res.send(result);
        });

        // Get All Skills
        app.get('/skills', async (req, res) => {
            let query = {};

            if (req.query.category) {
                query.category = req.query.category;
            }

            const result = await skillCollection.find(query).toArray();
            res.json(result);
        });

        // Create A New Skill
        app.post('/skills', async (req, res) => {
            const skill = req.body;
            const result = await skillCollection.insertOne(skill);
            res.send(result);
        });

        // Get All Blogs
        app.get('/blogs', async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.json(result);
        });

        // Get A Single Blog
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const result = await blogCollection.findOne({ _id: new ObjectId(id) });
            res.json(result);
        });

        // Create A New Blog
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            const result = await blogCollection.insertOne(blog);
            res.send(result);
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
    const serverStatus = {
        message: 'Server is running smoothly',
        timestamp: new Date()
    };
    res.json(serverStatus);
});