// src/models/Device.js
import mongoose, { Schema } from 'mongoose';

const DeviceSchema = new Schema({
    deviceId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    imei: { 
        type: String, 
        required: true, 
        unique: true 
    },
    owner: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    batteryLevel: { 
        type: Number, 
        min: 0, 
        max: 100 
    },
    lastSeen: { 
        type: Date, 
        default: Date.now 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

DeviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Device = mongoose.model('Device', DeviceSchema);
export { Device };
