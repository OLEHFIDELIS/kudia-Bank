import express, { Request, Response, Express, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

//create an app
const app = express();


app.use(
  cors({
    origin: '*',
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use((err:any, req:Request, res:Response, next:NextFunction) => {
  console.error(err.stack);
  if (err.message === 'Not allowed by CORS') {
    res.status(403).send('CORS Error: Access Denied');
  } else {
    res.status(500).send('Internal Server Error');
  }
});



app.get('/', (req : Request, res : Response) => {
  res.send(`Welcome to ${process.env.APPNAME}`);
});

const PORT = process.env.PORT || 5000;

const Boostrap = async function () {
  try {
    app.listen(PORT, () => {
      console.log('Connection has been established successfully.');
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

Boostrap();