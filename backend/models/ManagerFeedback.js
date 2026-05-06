import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    feedback: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    potentialRating: { type: Number, default: 2, min: 1, max: 3 }, // 1: Low, 2: Moderate, 3: High
    performanceRating: { type: Number, default: 2, min: 1, max: 3 } // 1: Low, 2: Moderate, 3: High
}, { timestamps: true });

export default mongoose.model('ManagerFeedback', feedbackSchema);
