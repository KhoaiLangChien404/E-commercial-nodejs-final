import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import authRoutes from './routes/auth.js';

const app = express();

const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(express.json());
const corsConfig = {
    origin: "*",
    credential: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}
app.options("", cors(corsConfig))
app.use(cors(corsConfig))

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);

app.get('/', (req, res) => {
    res.send('API Working');
});

app.listen(port, () => console.log('Server started on PORT: ' + port));
