// src/models/User.js
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import passport from 'passport';

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

UserSchema.methods.verifyPassword = function (password) {
    console.log('Password reçu:', password);
    console.log('Mot de passe dans le modèle:', this.password);
    return bcrypt.compareSync(password, this.password);
};

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) return done(null, false);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

const User = mongoose.model('User', UserSchema);

export { User };