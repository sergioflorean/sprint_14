import express from 'express';
import router from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(router);
app.use(errorHandler);

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
