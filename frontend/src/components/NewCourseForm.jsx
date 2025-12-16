import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewCourseForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 border rounded-lg p-6 shadow bg-white"
    >
      <div>
        <label className="block text-sm font-medium">Título del curso</label>
        <Input
          {...register("titulo", { required: "El título es obligatorio" })}
          placeholder="Ej. React desde cero"
        />
        {errors.titulo && (
          <p className="text-red-500 text-sm">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <Input
          {...register("categoria", { required: "La categoría es obligatoria" })}
          placeholder="Ej. Desarrollo"
        />
        {errors.categoria && (
          <p className="text-red-500 text-sm">{errors.categoria.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Precio (MXN)</label>
        <Input
          type="number"
          {...register("precio", { required: "El precio es obligatorio" })}
          placeholder="Ej. 199"
        />
        {errors.precio && (
          <p className="text-red-500 text-sm">{errors.precio.message}</p>
        )}
      </div>

      <Button type="submit" className="btn btn-primary w-full">
        Crear curso
      </Button>
    </form>
  );
}