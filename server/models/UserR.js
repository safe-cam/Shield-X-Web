import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

// add profile fields via schema add
userSchema.add({
  email: { type: String, default: '' },
  contact: { type: String, default: '' },
  avatar: { type: String, default: '' }, // data URL or image URL
  dobDay: { type: String, default: '' },
  dobMonth: { type: String, default: '' },
  dobYear: { type: String, default: '' },
  gender: { type: String, default: '' },
  contacts: [{ name: String, phone: String }]
});

export default mongoose.model('UserR', userSchema);
