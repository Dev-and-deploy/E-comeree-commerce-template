import { Category } from '../models/index.js';

// Get all categories (public)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true })
      .sort({ sort_order: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get all categories (admin)
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ sort_order: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get category by slug (public)
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ 
      slug, 
      is_active: true 
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Create category (admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image_url, parent_id, sort_order } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = new Category({
      name,
      slug,
      description: description || '',
      image_url: image_url || '',
      parent_id: parent_id || null,
      sort_order: sort_order || 0
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// Update category (admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, parent_id, sort_order, is_active } = req.body;
    
    // If name is being updated, generate new slug
    let updateData = { ...req.body };
    if (name) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      updateData.slug = slug;
    }
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// Delete category (admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};