import Favorite from "../models/Favorite.js";
import Course from "../models/Course.js";

// Agregar/quitar favorito
export const toggleFavorite = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const existingFavorite = await Favorite.findOne({
      user: userId,
      course: courseId
    });

    if (existingFavorite) {
      // Quitar de favoritos
      await Favorite.findByIdAndDelete(existingFavorite._id);
      res.status(200).json({ 
        message: "Curso eliminado de favoritos",
        isFavorite: false
      });
    } else {
      // Agregar a favoritos
      const favorite = await Favorite.create({
        user: userId,
        course: courseId
      });
      
      const populatedFavorite = await Favorite.findById(favorite._id)
        .populate("course", "title description imageUrl price instructor category rating ratingCount");
      
      res.status(201).json({ 
        message: "Curso agregado a favoritos",
        favorite: populatedFavorite,
        isFavorite: true
      });
    }
  } catch (err) {
    console.error("Error al gestionar favorito:", err);
    res.status(500).json({ message: "Error al gestionar favorito", error: err.message });
  }
};

// Obtener favoritos del usuario
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: "course",
        select: "title description imageUrl price instructor category rating ratingCount lessons",
        populate: [
          { path: "instructor", select: "name email photoUrl _id" },
          { path: "category", select: "name icon color" }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ favorites });
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    res.status(500).json({ message: "Error al obtener favoritos", error: err.message });
  }
};

// Verificar si un curso es favorito
export const checkFavorite = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      user: userId,
      course: courseId
    });

    res.status(200).json({ isFavorite: !!favorite });
  } catch (err) {
    console.error("Error al verificar favorito:", err);
    res.status(500).json({ message: "Error al verificar favorito", error: err.message });
  }
};

