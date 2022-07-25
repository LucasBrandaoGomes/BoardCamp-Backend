
import express, { json } from "express"
import  cors  from "cors"
import dotenv from 'dotenv';
import rentalsRoutes  from './routes/rentalsRoutes.js'
import categoriesRoutes from './routes/categoriesRoutes.js'
import gamesRoutes from './routes/gamesRoutes.js'
import customersRoutes from './routes/customersRoutes.js'

dotenv.config();
const app = express()

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(json());

app.use(rentalsRoutes);
app.use(categoriesRoutes);
app.use(gamesRoutes);
app.use(customersRoutes)


const PORT = process.env.PORT;
app.listen(PORT ,  () => console.log(`server running - port ${PORT}`));