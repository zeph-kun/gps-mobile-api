import {connectDB} from './src/db.js';
import {User} from './src/models/user.js';
import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;
const HOST = '127.0.0.1';

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/user', async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;
        const user = new User({
            firstName,
            lastName,
            email,
            password,
        });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

connectDB().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`API listening at http://${HOST}:${PORT}`);
    });
});