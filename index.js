require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: 'https://fantastic-malabi-f7d0be.netlify.app',
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const verifyJWT = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).send('Access Denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send('Access Denied. Invalid Token.');
    }
};

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('my-portfolio');
        const userCollection = db.collection('users');
        const projectCollection = db.collection('projects');
        const skillCollection = db.collection('skills');
        const blogCollection = db.collection('blogs');

        // jwt checking for testing
        app.get('/protected', verifyJWT, (req, res) => {
            res.send('Welcome to the protected route');
        });

        // User Login
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;

            // Find user by email
            const user = await userCollection.findOne({ email, password });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const jwtPayload = { email: user.email, role: user.role };
            const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
            const refreshToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

            res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 1000 * 60 * 60 * 24 * 365,
            })
            .json({
                success: true,
                message: 'Login successful',
                accessToken
            });
        });

        // Generate new access token using refresh token
        app.post('/refresh-token', (req, res) => {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).send('Access Denied. No refresh token provided.');
            }
        
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
                console.log(decoded);
                const jwtPayload = { email: decoded.email, role: decoded.role };
                const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
                console.log(accessToken);
    
                res.json({
                    success: true,
                    message: 'Access token is retrieved successfully.',
                    accessToken
                });
            } catch (error) {
                return res.status(400).send('Invalid refresh token.');
            }
        });

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
        app.post('/projects', verifyJWT, async (req, res) => {
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
        app.post('/skills', verifyJWT, async (req, res) => {
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
        app.post('/blogs', verifyJWT, async (req, res) => {
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