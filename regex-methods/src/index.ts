import express from "express";
import mongoose from "mongoose";
import router from "./routes/index.js";

const app = express();
const PORT = 3000;

mongoose
  .connect("mongodb://127.0.0.1:27017/egresadosdb")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error de conexión", err));

app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
