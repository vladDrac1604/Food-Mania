const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dishSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: false
  },
  steps: [{
    type: String
  }
  ],
  ingredients: [
    {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
    },
  ],
  type: {
    type: String,
    required: true
  },
  likes: [{
    type: String
  }]
})

module.exports = mongoose.model("Dish", dishSchema);
