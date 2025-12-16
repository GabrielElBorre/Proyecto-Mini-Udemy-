import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API from "../api/api";
import { FaBookmark, FaTrash, FaPlay } from "react-icons/fa";
import Notification from "./Notification";

export default function BookmarksPanel({ courseId, lessonId, videoTime = 0, onSeek }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", note: "" });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, [courseId, lessonId]);

  const fetchBookmarks = async () => {
    try {
      const url = lessonId
        ? `/bookmarks/course/${courseId}/lesson/${lessonId}`
        : `/bookmarks/course/${courseId}`;
      const { data } = await API.get(url);
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error("Error al cargar bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await API.post(`/bookmarks/course/${courseId}/lesson/${lessonId}`, {
        timestamp: Math.round(videoTime),
        title: formData.title.trim(),
        note: formData.note.trim()
      });
      
      setNotification({
        message: "Bookmark creado",
        type: "success"
      });
      
      setFormData({ title: "", note: "" });
      setShowForm(false);
      fetchBookmarks();
    } catch (err) {
      console.error("Error al crear bookmark:", err);
      setNotification({
        message: "Error al crear bookmark",
        type: "error"
      });
    }
  };

  const handleDelete = async (bookmarkId) => {
    if (!confirm("¿Eliminar este bookmark?")) return;

    try {
      await API.delete(`/bookmarks/${bookmarkId}`);
      setNotification({
        message: "Bookmark eliminado",
        type: "success"
      });
      fetchBookmarks();
    } catch (err) {
      console.error("Error al eliminar bookmark:", err);
      setNotification({
        message: "Error al eliminar bookmark",
        type: "error"
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FaBookmark className="text-purple-500" />
            Bookmarks
          </CardTitle>
          {lessonId && (
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancelar" : "+ Agregar"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && lessonId && (
          <form onSubmit={handleCreate} className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
            <div>
              <Label className="text-xs">Título (opcional)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del bookmark..."
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Nota (opcional)</Label>
              <Input
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Nota sobre este momento..."
                className="mt-1 h-8 text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">
              Tiempo actual: {formatTime(videoTime)}
            </p>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Guardar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: "", note: "" });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            <FaBookmark className="text-2xl mx-auto mb-2 opacity-50" />
            <p>No hay bookmarks aún</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bookmarks.map((bookmark) => (
              <motion.div
                key={bookmark._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded"
              >
                <div className="flex-1">
                  {bookmark.title && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {bookmark.title}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>⏱️ {formatTime(bookmark.timestamp)}</span>
                    {bookmark.note && (
                      <span className="truncate max-w-xs">• {bookmark.note}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  {onSeek && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSeek(bookmark.timestamp)}
                      className="h-7 w-7 p-0"
                      title="Ir a este momento"
                    >
                      <FaPlay className="text-xs" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(bookmark._id)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-xs" />
                  </Button>
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

