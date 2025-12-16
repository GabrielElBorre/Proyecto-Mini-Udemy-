import Note from "../models/Note.js";
import Course from "../models/Course.js";

// Crear o actualizar nota
export const createOrUpdateNote = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, content, timestamp } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "El contenido de la nota es requerido" });
    }

    // Verificar que el curso existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Buscar nota existente o crear nueva
    const noteData = {
      user: userId,
      course: courseId,
      title: title?.trim() || "",
      content: content.trim(),
      timestamp: timestamp || null
    };

    if (lessonId) {
      noteData.lesson = lessonId;
    }

    // Si hay timestamp, buscar nota existente en ese timestamp
    let note;
    if (timestamp) {
      note = await Note.findOne({
        user: userId,
        course: courseId,
        lesson: lessonId || null,
        timestamp: timestamp
      });
    }

    if (note) {
      // Actualizar nota existente
      note.title = noteData.title;
      note.content = noteData.content;
      await note.save();
    } else {
      // Crear nueva nota
      note = await Note.create(noteData);
    }

    const populatedNote = await Note.findById(note._id)
      .populate("course", "title")
      .populate("lesson", "title");

    res.status(201).json({ 
      message: note.updatedAt > note.createdAt ? "Nota actualizada" : "Nota creada",
      note: populatedNote 
    });
  } catch (err) {
    console.error("Error al guardar nota:", err);
    res.status(500).json({ message: "Error al guardar nota", error: err.message });
  }
};

// Obtener notas del usuario
export const getNotes = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    const query = { user: userId };
    if (courseId) query.course = courseId;
    if (lessonId) query.lesson = lessonId;

    const notes = await Note.find(query)
      .populate("course", "title")
      .populate("lesson", "title")
      .sort({ timestamp: 1, createdAt: -1 });

    res.status(200).json({ notes });
  } catch (err) {
    console.error("Error al obtener notas:", err);
    res.status(500).json({ message: "Error al obtener notas", error: err.message });
  }
};

// Eliminar nota
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    if (note.user.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta nota" });
    }

    await Note.findByIdAndDelete(noteId);
    res.status(200).json({ message: "Nota eliminada" });
  } catch (err) {
    console.error("Error al eliminar nota:", err);
    res.status(500).json({ message: "Error al eliminar nota", error: err.message });
  }
};

// Buscar notas
export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "El término de búsqueda debe tener al menos 2 caracteres" });
    }

    const searchRegex = new RegExp(q.trim(), "i");
    const notes = await Note.find({
      user: userId,
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
      .populate("course", "title")
      .populate("lesson", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ notes });
  } catch (err) {
    console.error("Error al buscar notas:", err);
    res.status(500).json({ message: "Error al buscar notas", error: err.message });
  }
};

