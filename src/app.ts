import express, { Request, Response } from 'express';
import userRouter from './routers/userRouter';
import cors from 'cors';
import { protect } from './controllers/authController';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*'
  })
);

app.use(protect);

app.get('/', (_: Request, response: Response) => {
  response.send('<h1>Hello from chat app!</h1>');
});

app.use('/api/v1/users', userRouter);

export default app;
