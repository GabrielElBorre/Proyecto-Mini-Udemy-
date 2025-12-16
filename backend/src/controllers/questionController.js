import Question from "../models/Question.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// Crear pregunta
export const createQuestion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: "Título y contenido son requeridos" });
    }

    // Verificar que el usuario esté inscrito
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: "Debes estar inscrito en el curso para hacer preguntas" 
      });
    }

    const question = await Question.create({
      course: courseId,
      lesson: lessonId || null,
      user: userId,
      title: title.trim(),
      content: content.trim()
    });

    const populatedQuestion = await Question.findById(question._id)
      .populate("user", "name email photoUrl")
      .populate("course", "title")
      .populate("lesson", "title");

    res.status(201).json({ 
      message: "Pregunta creada",
      question: populatedQuestion 
    });
  } catch (err) {
    console.error("Error al crear pregunta:", err);
    res.status(500).json({ message: "Error al crear pregunta", error: err.message });
  }
};

// Obtener preguntas de un curso/lección
export const getQuestions = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user?.id;

    const query = { course: courseId };
    if (lessonId) {
      query.lesson = lessonId;
    } else {
      query.lesson = null; // Solo preguntas generales del curso
    }

    const questions = await Question.find(query)
      .populate("user", "name email photoUrl")
      .populate("course", "title")
      .populate("lesson", "title")
      .populate({
        path: "answers.user",
        select: "name email photoUrl"
      })
      .sort({ createdAt: -1 });

    // Incrementar views si el usuario no es el autor
    if (userId) {
      for (const question of questions) {
        if (question.user._id.toString() !== userId) {
          question.views += 1;
          await question.save();
        }
      }
    }

    res.status(200).json({ questions });
  } catch (err) {
    console.error("Error al obtener preguntas:", err);
    res.status(500).json({ message: "Error al obtener preguntas", error: err.message });
  }
};

// Responder pregunta
export const answerQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "El contenido de la respuesta es requerido" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    // Verificar que el usuario esté inscrito en el curso
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: question.course
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: "Debes estar inscrito en el curso para responder" 
      });
    }

    question.answers.push({
      user: userId,
      content: content.trim()
    });

    await question.save();

    const populatedQuestion = await Question.findById(question._id)
      .populate("user", "name email photoUrl")
      .populate("course", "title")
      .populate("lesson", "title")
      .populate({
        path: "answers.user",
        select: "name email photoUrl"
      });

    res.status(201).json({ 
      message: "Respuesta agregada",
      question: populatedQuestion 
    });
  } catch (err) {
    console.error("Error al responder pregunta:", err);
    res.status(500).json({ message: "Error al responder pregunta", error: err.message });
  }
};

// Marcar pregunta como útil/no útil
export const voteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { helpful } = req.body; // true o false
    const userId = req.user.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    // Remover de ambos arrays primero
    question.helpful = question.helpful.filter(id => id.toString() !== userId);
    question.notHelpful = question.notHelpful || [];
    question.notHelpful = question.notHelpful.filter(id => id.toString() !== userId);

    // Agregar al array correspondiente
    if (helpful === true) {
      question.helpful.push(userId);
    } else if (helpful === false) {
      if (!question.notHelpful) question.notHelpful = [];
      question.notHelpful.push(userId);
    }

    await question.save();

    res.status(200).json({ 
      message: "Voto registrado",
      helpful: question.helpful.length,
      notHelpful: question.notHelpful?.length || 0
    });
  } catch (err) {
    console.error("Error al votar pregunta:", err);
    res.status(500).json({ message: "Error al votar pregunta", error: err.message });
  }
};

// Marcar respuesta como útil/no útil
export const voteAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { helpful } = req.body;
    const userId = req.user.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Respuesta no encontrada" });
    }

    // Remover de ambos arrays
    answer.helpful = answer.helpful.filter(id => id.toString() !== userId);
    answer.notHelpful = answer.notHelpful || [];
    answer.notHelpful = answer.notHelpful.filter(id => id.toString() !== userId);

    // Agregar al array correspondiente
    if (helpful === true) {
      answer.helpful.push(userId);
    } else if (helpful === false) {
      if (!answer.notHelpful) answer.notHelpful = [];
      answer.notHelpful.push(userId);
    }

    await question.save();

    res.status(200).json({ 
      message: "Voto registrado",
      helpful: answer.helpful.length,
      notHelpful: answer.notHelpful?.length || 0
    });
  } catch (err) {
    console.error("Error al votar respuesta:", err);
    res.status(500).json({ message: "Error al votar respuesta", error: err.message });
  }
};

// Eliminar pregunta
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    if (question.user.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta pregunta" });
    }

    await Question.findByIdAndDelete(questionId);
    res.status(200).json({ message: "Pregunta eliminada" });
  } catch (err) {
    console.error("Error al eliminar pregunta:", err);
    res.status(500).json({ message: "Error al eliminar pregunta", error: err.message });
  }
};

