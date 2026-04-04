import mongoose from 'mongoose';

const kpiSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    target: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    category: {
        type: String,
        enum: ['Innovation', 'Customer Success', 'Operational Excellence', 'Team Leadership'],
        default: 'Operational Excellence'
    },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('KPI', kpiSchema);
