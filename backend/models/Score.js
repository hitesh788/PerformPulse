import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kpiId: { type: mongoose.Schema.Types.ObjectId, ref: 'KPI', required: true },
    value: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

export default mongoose.model('Score', scoreSchema);
