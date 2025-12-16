import Category from "../models/Category.js";

// Obtener todas las categorías
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });
    
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    res.status(500).json({ message: "Error al obtener categorías", error: err.message });
  }
};

// Obtener categoría por ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    
    res.status(200).json(category);
  } catch (err) {
    console.error("Error al obtener categoría:", err);
    res.status(500).json({ message: "Error al obtener categoría", error: err.message });
  }
};

// Crear categoría (solo para administradores en el futuro)
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "El nombre de la categoría es requerido" });
    }
    
    const category = await Category.create({
      name: name.trim(),
      description: description?.trim(),
      icon: icon || "📚",
      color: color || "#6366f1",
    });
    
    res.status(201).json({ message: "Categoría creada", category });
  } catch (err) {
    console.error("Error al crear categoría:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ message: "Error al crear categoría", error: err.message });
  }
};


