const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  ingredients: [String],
  dietaryOptions: {
    vegetarian: Boolean,
    vegan: Boolean,
    glutenFree: Boolean
  },
  imageUrl: String,
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);