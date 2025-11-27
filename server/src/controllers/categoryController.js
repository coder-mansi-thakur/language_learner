import Category from '../models/Category.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createCategory = async (req, res) => {
  const { name, slug, description } = req.body;
  try {
    const category = await Category.create({ name, slug, description });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.description = description || category.description;
    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
