import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import kpiRoutes from './routes/kpi.js';
import progressRoutes from './routes/progress.js';
import evaluationRoutes from './routes/evaluation.js';
import scoreRoutes from './routes/score.js';
import peerReviewRoutes from './routes/peerReview.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/peer-review', peerReviewRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/performpulse', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.log(err));
