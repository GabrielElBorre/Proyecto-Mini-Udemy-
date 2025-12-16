import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Notification from "@/components/Notification";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", photoUrl: "" });
  const [stats, setStats] = useState(null);
  const [notification, setNotification] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  async function fetchProfile() {
    try {
      const { data } = await API.get("/users/me");
      setFormData({
        name: data.name || "",
        photoUrl: data.photoUrl || "",
      });
      setStats(data.stats);
      // Si hay una foto guardada (base64 o URL), mostrarla en el preview
      if (data.photoUrl) {
        setPreviewImage(null); // Reset preview para mostrar la foto guardada
      }
    } catch (err) {
      console.error("Error al cargar perfil:", err);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setNotification({ 
        message: "Por favor selecciona un archivo de imagen válido", 
        type: "error" 
      });
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setNotification({ 
        message: "La imagen debe ser menor a 2MB. Por favor comprime la imagen o selecciona otra.", 
        type: "error" 
      });
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({ ...formData, photoUrl: base64String });
      setPreviewImage(base64String);
    };
    reader.onerror = () => {
      setNotification({ 
        message: "Error al leer el archivo", 
        type: "error" 
      });
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdate() {
    try {
      setLoading(true);
      const { data } = await API.put("/users/me", formData);
      setUser(data.user);
      setEditing(false);
      setPreviewImage(null);
      setNotification({ message: "Perfil actualizado exitosamente ✓", type: "success" });
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || "Error al actualizar perfil", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Mi Perfil 👤</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={previewImage || formData.photoUrl || user.photoUrl || "https://placehold.co/100x100"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                />
                {editing && (
                  <div className="absolute bottom-0 right-0">
                    <label className="cursor-pointer">
                      <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {editing ? formData.name : user.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  user.role === "instructor" 
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" 
                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                }`}>
                  {user.role === "instructor" ? "Instructor" : "Estudiante"}
                </span>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900 dark:text-white">Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-900 dark:text-white mb-2 block">
                    Foto de Perfil
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Subir Foto
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Máximo 2MB (JPG, PNG, GIF)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      O ingresa una URL:
                    </div>
                    <Input
                      value={formData.photoUrl && !formData.photoUrl.startsWith('data:') ? formData.photoUrl : ''}
                      onChange={(e) => {
                        if (!e.target.value.startsWith('data:')) {
                          setFormData({ ...formData, photoUrl: e.target.value });
                          setPreviewImage(null);
                        }
                      }}
                      placeholder="https://ejemplo.com/foto.jpg"
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setPreviewImage(null);
                      setFormData({
                        name: user.name || "",
                        photoUrl: user.photoUrl || "",
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900 dark:text-white">Nombre</Label>
                  <Input value={user.name || ""} disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-gray-900 dark:text-white">Email</Label>
                  <Input value={user.email || ""} disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-gray-900 dark:text-white">Rol</Label>
                  <Input 
                    value={user.role === "instructor" ? "Instructor" : "Estudiante"} 
                    disabled 
                    className="mt-1" 
                  />
                </div>
                <Button onClick={() => setEditing(true)} className="w-full">
                  Editar Perfil
                </Button>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(user.role === "instructor" ? "/instructor" : "/dashboard")}
                className="w-full"
              >
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enlaces rápidos a nuevas funcionalidades */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Funcionalidades Avanzadas 🚀</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/achievements">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                  <span className="text-3xl">🏆</span>
                  <span className="font-semibold">Logros</span>
                  <span className="text-xs text-gray-500">Desbloquea insignias</span>
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                  <span className="text-3xl">📊</span>
                  <span className="font-semibold">Analytics</span>
                  <span className="text-xs text-gray-500">Gráficos avanzados</span>
                </Button>
              </Link>
              <Link to="/timeline">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition">
                  <span className="text-3xl">📅</span>
                  <span className="font-semibold">Timeline</span>
                  <span className="text-xs text-gray-500">Tu viaje de aprendizaje</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Mis Estadísticas 📊</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                {user.role === "instructor" ? (
                  <>
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                      <p className="text-sm opacity-90">Cursos Creados</p>
                      <p className="text-3xl font-bold">{stats.coursesCreated || 0}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                        <p className="text-sm opacity-90">Cursos Inscritos</p>
                        <p className="text-3xl font-bold">{stats.totalCourses || 0}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
                        <p className="text-sm opacity-90">Completados</p>
                        <p className="text-3xl font-bold">{stats.completedCourses || 0}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg">
                        <p className="text-sm opacity-90">Lecciones Completadas</p>
                        <p className="text-3xl font-bold">{stats.totalLessons || 0}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg">
                        <p className="text-sm opacity-90">Reseñas Escritas</p>
                        <p className="text-3xl font-bold">{stats.totalReviews || 0}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notificaciones */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
    </div>
  );
}
