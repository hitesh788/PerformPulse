import mongoose from 'mongoose';

const reviewCycleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Completed', 'Draft'], default: 'Draft' }
}, { timestamps: true });

export default mongoose.model('ReviewCycle', reviewCycleSchema);
