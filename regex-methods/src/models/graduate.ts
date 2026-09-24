import mongoose from "mongoose";

// Un nombre de usuario válido: entre 3 y 16 caracteres (letras, números o "_").
const usernameRegex = /^\w{3,16}$/;
const websiteRegex = /^https?:\/\/(www\.)?[\w-]+\.\w+$/i;

const graduateSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => usernameRegex.test(value),
      message: "El nombre de usuario debe tener entre 3 y 16 caracteres",
    },
  },
  website: {
  type: String,
  required: true,
  validate: {
    validator: (value: string) => websiteRegex.test(value),
    message: "El sitio web no tiene un formato válido",
  },
},

  graduationYear: {
    type: Number,
  },
});

const Graduate = mongoose.model("Graduate", graduateSchema);

export default Graduate;
