import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LessonForm({ lessons = [], onChange }) {
  const [localLessons, setLocalLessons] = useState(lessons || []);

  // Sincronizar cuando cambian las lecciones desde el padre
  useEffect(() => {
    if (lessons) {
      setLocalLessons(lessons);
    }
  }, [lessons]);

  const addLesson = () => {
    const newLesson = {
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      order: localLessons.length + 1,
    };
    const updated = [...localLessons, newLesson];
    setLocalLessons(updated);
    if (onChange) onChange(updated);
  };

  const updateLesson = (index, field, value) => {
    const updated = [...localLessons];
    updated[index] = { ...updated[index], [field]: value };
    setLocalLessons(updated);
    if (onChange) onChange(updated);
  };

  const removeLesson = (index) => {
    const updated = localLessons.filter((_, i) => i !== index);
    // Reordenar
    updated.forEach((lesson, i) => {
      lesson.order = i + 1;
    });
    setLocalLessons(updated);
    if (onChange) onChange(updated);
  };

  const moveLesson = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === localLessons.length - 1)
    ) {
      return;
    }

    const updated = [...localLessons];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Actualizar orden
    updated.forEach((lesson, i) => {
      lesson.order = i + 1;
    });
    setLocalLessons(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Lecciones del Curso</Label>
        <Button type="button" onClick={addLesson} variant="outline" size="sm">
          + Agregar Lección
        </Button>
      </div>

      {localLessons.length === 0 ? (
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No hay lecciones. Agrega al menos una lección para tu curso.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {localLessons.map((lesson, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full font-semibold">
                      {index + 1}
                    </span>
                    <Label className="text-base font-semibold text-gray-900 dark:text-white">
                      Lección {index + 1}
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => moveLesson(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => moveLesson(index, "down")}
                      disabled={index === localLessons.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeLesson(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-900 dark:text-white">Título de la lección *</Label>
                    <Input
                      value={lesson.title}
                      onChange={(e) => updateLesson(index, "title", e.target.value)}
                      placeholder="Ej. Introducción a React"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-white">Descripción</Label>
                    <Textarea
                      value={lesson.description || ""}
                      onChange={(e) => updateLesson(index, "description", e.target.value)}
                      placeholder="Describe el contenido de esta lección..."
                      className="mt-1 min-h-[80px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-900 dark:text-white">URL del Video (YouTube/Vimeo) *</Label>
                      <Input
                        value={lesson.videoUrl || ""}
                        onChange={(e) => updateLesson(index, "videoUrl", e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-white">Duración (minutos)</Label>
                      <Input
                        type="number"
                        value={lesson.duration || 0}
                        onChange={(e) =>
                          updateLesson(index, "duration", parseInt(e.target.value) || 0)
                        }
                        placeholder="30"
                        className="mt-1"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

