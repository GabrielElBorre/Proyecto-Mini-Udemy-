import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import { 
  FaQuestionCircle, 
  FaPlus, 
  FaThumbsUp, 
  FaThumbsDown,
  FaCheckCircle,
  FaTimes
} from "react-icons/fa";
import Notification from "./Notification";

export default function QuestionsPanel({ courseId, lessonId }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [answeringTo, setAnsweringTo] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [courseId, lessonId]);

  const fetchQuestions = async () => {
    try {
      const url = lessonId
        ? `/questions/course/${courseId}/lesson/${lessonId}`
        : `/questions/course/${courseId}`;
      const { data } = await API.get(url);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("Error al cargar preguntas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setNotification({
        message: "Título y contenido son requeridos",
        type: "error"
      });
      return;
    }

    try {
      const url = lessonId
        ? `/questions/course/${courseId}/lesson/${lessonId}`
        : `/questions/course/${courseId}`;
      
      await API.post(url, formData);
      
      setNotification({
        message: "Pregunta publicada",
        type: "success"
      });
      
      setFormData({ title: "", content: "" });
      setShowForm(false);
      fetchQuestions();
    } catch (err) {
      console.error("Error al crear pregunta:", err);
      setNotification({
        message: err.response?.data?.message || "Error al crear pregunta",
        type: "error"
      });
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    if (!answerContent.trim()) {
      setNotification({
        message: "El contenido de la respuesta es requerido",
        type: "error"
      });
      return;
    }

    try {
      await API.post(`/questions/${questionId}/answer`, {
        content: answerContent.trim()
      });
      
      setNotification({
        message: "Respuesta publicada",
        type: "success"
      });
      
      setAnswerContent("");
      setAnsweringTo(null);
      fetchQuestions();
    } catch (err) {
      console.error("Error al responder:", err);
      setNotification({
        message: err.response?.data?.message || "Error al responder",
        type: "error"
      });
    }
  };

  const handleVote = async (questionId, helpful) => {
    if (!user) return;

    try {
      await API.post(`/questions/${questionId}/vote`, { helpful });
      fetchQuestions();
    } catch (err) {
      console.error("Error al votar:", err);
    }
  };

  const handleVoteAnswer = async (questionId, answerId, helpful) => {
    if (!user) return;

    try {
      await API.post(`/questions/${questionId}/answer/${answerId}/vote`, { helpful });
      fetchQuestions();
    } catch (err) {
      console.error("Error al votar respuesta:", err);
    }
  };

  const isUserVoted = (item, userId) => {
    if (!userId || !item) return { helpful: false, notHelpful: false };
    return {
      helpful: item.helpful?.some(id => id.toString() === userId) || false,
      notHelpful: item.notHelpful?.some(id => id.toString() === userId) || false
    };
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FaQuestionCircle className="text-blue-500" />
            Preguntas y Respuestas
          </CardTitle>
          {user && (
            <Button
              size="sm"
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setFormData({ title: "", content: "" });
                }
              }}
            >
              {showForm ? <FaTimes /> : <><FaPlus className="mr-2" />Nueva Pregunta</>}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {showForm && user && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmitQuestion}
              className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3"
            >
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resumen de tu pregunta..."
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Pregunta *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe tu pregunta en detalle..."
                  rows={4}
                  className="mt-1"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Publicar Pregunta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: "", content: "" });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaQuestionCircle className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No hay preguntas aún</p>
            {user && !showForm && (
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                Hacer primera pregunta
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((question) => {
              const userVote = isUserVoted(question, user?._id);
              return (
                <motion.div
                  key={question._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {question.title}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {question.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{question.user?.name || "Usuario"}</span>
                        <span>{new Date(question.createdAt).toLocaleDateString("es-ES")}</span>
                        <span>{question.views} vistas</span>
                      </div>
                    </div>
                    {user && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVote(question._id, true)}
                          className={`h-8 px-2 ${userVote.helpful ? "text-blue-600" : ""}`}
                        >
                          <FaThumbsUp className="text-xs mr-1" />
                          {question.helpful?.length || 0}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVote(question._id, false)}
                          className={`h-8 px-2 ${userVote.notHelpful ? "text-red-600" : ""}`}
                        >
                          <FaThumbsDown className="text-xs mr-1" />
                          {question.notHelpful?.length || 0}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Respuestas */}
                  {question.answers && question.answers.length > 0 && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                      {question.answers.map((answer) => {
                        const answerVote = isUserVoted(answer, user?._id);
                        return (
                          <div key={answer._id} className="p-3 bg-white dark:bg-gray-800 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {answer.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{answer.user?.name || "Usuario"}</span>
                                <span>{new Date(answer.createdAt).toLocaleDateString("es-ES")}</span>
                              </div>
                              {user && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleVoteAnswer(question._id, answer._id, true)}
                                    className={`h-6 px-2 text-xs ${answerVote.helpful ? "text-blue-600" : ""}`}
                                  >
                                    <FaThumbsUp className="text-xs mr-1" />
                                    {answer.helpful?.length || 0}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleVoteAnswer(question._id, answer._id, false)}
                                    className={`h-6 px-2 text-xs ${answerVote.notHelpful ? "text-red-600" : ""}`}
                                  >
                                    <FaThumbsDown className="text-xs mr-1" />
                                    {answer.notHelpful?.length || 0}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Formulario de respuesta */}
                  {user && answeringTo === question._id ? (
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <Textarea
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        rows={3}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitAnswer(question._id)}
                        >
                          Responder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAnsweringTo(null);
                            setAnswerContent("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : user && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setAnsweringTo(question._id)}
                    >
                      Responder
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
    </Card>
  );
}

