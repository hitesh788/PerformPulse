import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import kpiRoutes from './routes/kpi.js';
import progressRoutes from './routes/progress.js';
import evaluationRoutes from './routes/evaluation.js';
import scoreRoutes from './routes/score.js';
import peerReviewRoutes from './routes/peerReview.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';


dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Make io accessible to our routes
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/peer-review', peerReviewRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/admin', adminRoutes);


io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/performpulse', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.log(err));

