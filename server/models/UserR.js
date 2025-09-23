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
});

export default mongoose.model('UserR', userSchema);
