import express, { Request, Response } from 'express';

const app = express();

app.get('/', (_: Request, response: Response) => {
  response.send('<h1>Hello from chat app!</h1>');
});

export default app;
