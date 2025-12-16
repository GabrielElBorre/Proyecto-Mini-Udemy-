import Bookmark from "../models/Bookmark.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// Crear bookmark
export const createBookmark = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { timestamp, title, note } = req.body;
    const userId = req.user.id;

    if (timestamp === undefined || timestamp < 0) {
      return res.status(400).json({ message: "El timestamp es requerido y debe ser positivo" });
    }

    // Verificar que el usuario esté inscrito
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: "Debes estar inscrito en el curso para crear bookmarks" 
      });
    }

    const bookmark = await Bookmark.create({
      user: userId,
      course: courseId,
      lesson: lessonId,
      timestamp: Math.round(timestamp),
      title: title?.trim() || "",
      note: note?.trim() || ""
    });

    const populatedBookmark = await Bookmark.findById(bookmark._id)
      .populate("course", "title")
      .populate("lesson", "title");

    res.status(201).json({ 
      message: "Bookmark creado",
      bookmark: populatedBookmark 
    });
  } catch (err) {
    console.error("Error al crear bookmark:", err);
    res.status(500).json({ message: "Error al crear bookmark", error: err.message });
  }
};

// Obtener bookmarks
export const getBookmarks = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    const query = { user: userId };
    if (courseId) query.course = courseId;
    if (lessonId) query.lesson = lessonId;

    const bookmarks = await Bookmark.find(query)
      .populate("course", "title")
      .populate("lesson", "title")
      .sort({ timestamp: 1 });

    res.status(200).json({ bookmarks });
  } catch (err) {
    console.error("Error al obtener bookmarks:", err);
    res.status(500).json({ message: "Error al obtener bookmarks", error: err.message });
  }
};

// Eliminar bookmark
export const deleteBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user.id;

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark no encontrado" });
    }

    if (bookmark.user.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este bookmark" });
    }

    await Bookmark.findByIdAndDelete(bookmarkId);
    res.status(200).json({ message: "Bookmark eliminado" });
  } catch (err) {
    console.error("Error al eliminar bookmark:", err);
    res.status(500).json({ message: "Error al eliminar bookmark", error: err.message });
  }
};

