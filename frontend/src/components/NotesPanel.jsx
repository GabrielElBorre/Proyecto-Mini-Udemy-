import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import API from "../api/api";
import { FaStickyNote, FaSearch, FaTrash, FaEdit, FaTimes } from "react-icons/fa";
import Notification from "./Notification";

export default function NotesPanel({ courseId, lessonId, videoTime = 0 }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [courseId, lessonId]);

  const fetchNotes = async () => {
    try {
      const url = lessonId 
        ? `/notes/course/${courseId}/lesson/${lessonId}`
        : `/notes/course/${courseId}`;
      const { data } = await API.get(url);
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Error al cargar notas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setNotification({
        message: "El contenido de la nota es requerido",
        type: "error"
      });
      return;
    }

    try {
      const url = lessonId
        ? `/notes/course/${courseId}/lesson/${lessonId}`
        : `/notes/course/${courseId}`;
      
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        timestamp: lessonId ? Math.round(videoTime) : null
      };

      await API.post(url, payload);
      
      setNotification({
        message: editingNote ? "Nota actualizada" : "Nota creada",
        type: "success"
      });
      
      setFormData({ title: "", content: "" });
      setShowForm(false);
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      console.error("Error al guardar nota:", err);
      setNotification({
        message: "Error al guardar nota",
        type: "error"
      });
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || "",
      content: note.content || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (noteId) => {
    if (!confirm("¿Eliminar esta nota?")) return;

    try {
      await API.delete(`/notes/${noteId}`);
      setNotification({
        message: "Nota eliminada",
        type: "success"
      });
      fetchNotes();
    } catch (err) {
      console.error("Error al eliminar nota:", err);
      setNotification({
        message: "Error al eliminar nota",
        type: "error"
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title?.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FaStickyNote className="text-yellow-500" />
            Notas
          </CardTitle>
          <div className="flex gap-2">
            {notes.length > 0 && (
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <Input
                  type="text"
                  placeholder="Buscar notas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 h-8 text-sm"
                />
              </div>
            )}
            <Button
              size="sm"
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setEditingNote(null);
                  setFormData({ title: "", content: "" });
                }
              }}
            >
              {showForm ? <FaTimes /> : "+ Nueva Nota"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3"
            >
              <div>
                <Label>Título (opcional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la nota..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contenido *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escribe tu nota aquí..."
                  rows={4}
                  className="mt-1"
                  required
                />
              </div>
              {lessonId && (
                <p className="text-xs text-gray-500">
                  Timestamp: {formatTime(videoTime)}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  {editingNote ? "Actualizar" : "Guardar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
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
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaStickyNote className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No hay notas aún</p>
            {!showForm && (
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                Crear primera nota
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {note.title && (
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {note.title}
                      </h4>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {note.timestamp && (
                        <span>⏱️ {formatTime(note.timestamp)}</span>
                      )}
                      <span>
                        {new Date(note.createdAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(note)}
                      className="h-8 w-8 p-0"
                    >
                      <FaEdit className="text-xs" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(note._id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="text-xs" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
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

