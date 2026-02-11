import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  image_url: {
    type: String,
    trim: true
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  sort_order: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ sort_order: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;