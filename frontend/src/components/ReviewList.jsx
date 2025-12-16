import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";
import API from "../api/api";
import useAuth from "@/hooks/useAuth";
import Rating from "./Rating";
import ReviewForm from "./ReviewForm";

export default function ReviewList({ courseId, onReviewUpdate }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [editingReview, setEditingReview] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, reviewId: null });

  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchMyReview();
    }
  }, [courseId, user]);

  async function fetchReviews() {
    try {
      const { data } = await API.get(`/reviews/courses/${courseId}`);
      setReviews(data);
    } catch (err) {
      console.error("Error al cargar reseñas:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyReview() {
    try {
      const { data } = await API.get(`/reviews/courses/${courseId}/my-review`);
      setMyReview(data);
    } catch (err) {
      setMyReview(null);
    }
  }

  function handleDelete(reviewId) {
    setConfirmDialog({
      isOpen: true,
      reviewId,
      title: "Eliminar Reseña",
      message: "¿Estás seguro de que quieres eliminar tu reseña? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      type: "danger"
    });
  }

  async function confirmDelete() {
    if (!confirmDialog.reviewId) return;

    try {
      await API.delete(`/reviews/${confirmDialog.reviewId}`);
      setMyReview(null);
      setEditingReview(false);
      fetchReviews();
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (err) {
      console.error("Error al eliminar la reseña:", err);
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-600 dark:text-gray-400">Cargando reseñas...</div>;
  }

  const otherReviews = reviews.filter(
    (review) => !myReview || review._id !== myReview._id
  );

  return (
    <div className="space-y-6">
      {/* Reseña del usuario actual */}
      {myReview && !editingReview && (
        <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={myReview.student?.photoUrl || "https://placehold.co/40x40"}
                  alt={myReview.student?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Tu reseña
                    </h4>
                    <Rating rating={myReview.rating} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(myReview.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {myReview.comment && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {myReview.comment}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingReview(true)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(myReview._id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario de edición */}
      {editingReview && myReview && (
        <ReviewForm
          courseId={courseId}
          existingReview={myReview}
          onReviewSubmitted={() => {
            setEditingReview(false);
            fetchMyReview();
            fetchReviews();
            if (onReviewUpdate) {
              onReviewUpdate();
            }
          }}
        />
      )}

      {/* Otras reseñas */}
      {otherReviews.length === 0 && !myReview ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Aún no hay reseñas para este curso. ¡Sé el primero en dejar una!
            </p>
          </CardContent>
        </Card>
      ) : (
        otherReviews.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Reseñas de otros estudiantes ({otherReviews.length})
            </h3>
            {otherReviews.map((review) => (
              <Card
                key={review._id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={review.student?.photoUrl || "https://placehold.co/40x40"}
                        alt={review.student?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {review.student?.name || "Usuario"}
                          </h4>
                          <Rating rating={review.rating} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {review.comment && (
                          <p className="text-gray-700 dark:text-gray-300 mt-2">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )
      )}

      {/* Dialog de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, reviewId: null })}
        onConfirm={confirmDelete}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
      />
    </div>
  );
}

