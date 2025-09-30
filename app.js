import express from "express";
import 'dotenv/config'
import cookieParser from 'cookie-parser';
import routes from './routes/index.js'

const app = express()
const PORT = 8000

app.use(express.json());
app.use(cookieParser());
app.use(routes);

app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});