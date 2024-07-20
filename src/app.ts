import express, { Request, Response } from 'express';
import userRouter from './routers/userRouter';
import roomRouter from './routers/roomRouter';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true
  })
);
app.use(cookieParser());

app.get('/', (_: Request, response: Response) => {
  response.send('<h1>Hello from chat app!</h1>');
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/rooms', roomRouter);

export default app;
