import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LessonForm from "./LessonForm";

export default function NewCourseFormPro({ onSubmit, initialData }) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [lessons, setLessons] = useState(initialData?.lessons || []);

  useEffect(() => {
    if (initialData) {
      // Manejar categoría como objeto o string
      const categoryValue = typeof initialData.category === 'object' && initialData.category !== null
        ? initialData.category.name || initialData.category
        : initialData.category || "Desarrollo";
      
      reset({
        titulo: initialData.title,
        descripcion: initialData.description,
        precio: initialData.price,
        categoria: categoryValue,
        imagenUrl: initialData.imageUrl,
        recursos: initialData.resources?.join(", ") || "",
      });
      setLessons(initialData.lessons || []);
    } else {
      // Resetear formulario cuando no hay initialData (nuevo curso)
      reset({
        titulo: "",
        descripcion: "",
        precio: 0,
        categoria: "Desarrollo",
        imagenUrl: "",
        recursos: "",
      });
      setLessons([]);
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      lecciones: lessons,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
    >
      {/* Título */}
      <div>
        <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
          Título del curso *
        </label>
        <Input 
          {...register("titulo", { required: "El título es requerido" })} 
          placeholder="Ej. React desde cero"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
          Descripción *
        </label>
        <Textarea
          {...register("descripcion", { required: "La descripción es requerida" })}
          placeholder="Describe brevemente el curso..."
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>

      {/* Categoría */}
      <div>
        <Label className="block font-semibold mb-2 text-gray-900 dark:text-white">Categoría</Label>
        <select
          {...register("categoria")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="Desarrollo">Desarrollo</option>
          <option value="Diseño">Diseño</option>
          <option value="Negocios">Negocios</option>
          <option value="Marketing">Marketing</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      {/* URL de imagen */}
      <div>
        <Label className="block font-semibold mb-2 text-gray-900 dark:text-white">URL de Imagen</Label>
        <Input 
          {...register("imagenUrl")} 
          placeholder="https://ejemplo.com/imagen.jpg"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Precio - Todos los cursos son gratis */}
      <div>
        <Label className="block font-semibold mb-2 text-gray-900 dark:text-white">Precio (MXN) *</Label>
        <Input 
          type="number" 
          {...register("precio")} 
          placeholder="0" 
          min="0" 
          defaultValue="0"
          required 
          readOnly
          className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Todos los cursos son gratuitos
        </p>
      </div>

      {/* Lecciones */}
      <div>
        <LessonForm lessons={lessons} onChange={setLessons} />
      </div>

      {/* Recursos adicionales */}
      <div>
        <Label className="block font-semibold mb-2 text-gray-900 dark:text-white">
          Recursos Adicionales (URLs separadas por comas)
        </Label>
        <Textarea
          {...register("recursos")}
          placeholder="https://ejemplo.com/recurso1.pdf, https://ejemplo.com/recurso2.pdf"
          className="min-h-[80px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Separa múltiples URLs con comas
        </p>
      </div>

      {/* Botón */}
      <Button type="submit" className="btn btn-primary w-full">
        Publicar curso
      </Button>
    </form>
  );
}