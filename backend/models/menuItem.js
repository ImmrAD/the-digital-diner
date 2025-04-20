const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [String],
  dietaryInfo: { type: String, enum: ['veg', 'non-veg', 'vegan'] },
  calories: { type: Number, required: true },
  prices: {
    small: { type: Number, required: true },
    medium: { type: Number, required: true },
    large: { type: Number, required: true }
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Appetizers', 'Main Courses', 'Desserts', 'Drinks']
  },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);