import express, { Request, Response } from 'express';
import userRouter from './routers/userRouter';

const app = express();

app.use(express.json());

app.get('/', (_: Request, response: Response) => {
  response.send('<h1>Hello from chat app!</h1>');
});

app.use('/api/v1/users', userRouter);

export default app;
