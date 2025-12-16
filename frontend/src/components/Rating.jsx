export default function Rating({ value, rating }) {
  // Acepta tanto 'value' como 'rating' para compatibilidad
  const ratingValue = rating !== undefined ? rating : value || 0;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (ratingValue >= i) {
      stars.push("★");
    } else if (ratingValue >= i - 0.5) {
      stars.push("☆");
    } else {
      stars.push("✩");
    }
  }

  return (
    <span className="text-yellow-500 text-lg tracking-wide">
      {stars.join(" ")}
    </span>
  );
}