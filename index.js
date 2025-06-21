import {connectDB} from './src/db.js';
import {User} from './src/models/user.js';
import express from 'express';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const app = express();

// 1. Middlewares de parsing du body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Configuration de la session
app.use(session({
    name: "connect.sid",
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/mobile-db',
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // = 14 days
    }),
}));

// 3. Initialisation de Passport APRÈS la session
app.use(passport.initialize());
app.use(passport.session());

// 4. Configuration de la stratégie Passport
passport.use(new LocalStrategy(
    {usernameField: 'email'},
    async function(email, password, done) {
        try {
            const user = await User.findOne({ email });
            if (!user) return done(null, false, { message: 'Utilisateur non trouvé' });
            const isValid = await user.verifyPassword(password);
            if (!isValid) return done(null, false, { message: 'Mot de passe incorrect' });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// 5. Configuration de la sérialisation/désérialisation
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

const PORT = process.env.PORT || 8080;
const HOST = '127.0.0.1';

// Vos routes...
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

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: info?.message || 'Identifiants invalides'
            });
        }
        
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erreur de connexion'
                });
            }
            
            return res.json({
                success: true,
                message: 'Connexion réussie',
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        });
    })(req, res, next);
});

connectDB().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`API listening at http://${HOST}:${PORT}`);
    });
});
