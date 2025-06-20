// src/models/Location.js
import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema({
    device: { 
        type: Schema.Types.ObjectId, 
        ref: 'Device', 
        required: true 
    },
    latitude: { 
        type: Number, 
        required: true,
        min: -90,
        max: 90
    },
    longitude: { 
        type: Number, 
        required: true,
        min: -180,
        max: 180
    },
    timestamp: { 
        type: Date, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Index pour optimiser les requêtes
LocationSchema.index({ device: 1, timestamp: -1 });
LocationSchema.index({ device: 1, createdAt: -1 });

const Location = mongoose.model('Location', LocationSchema);
export { Location };
