import { useCountUp } from "./useCountUp";

export default function CountUpCard({ title, value, bg = "" }) {
  let numericValue = 0;
  let isCurrency = false;

  if (typeof value === "string") {
    // Extract numeric value from currency string (e.g., "13.310.000 ₫" -> 13310000)
    const cleanValue = value.replace(/[^\d]/g, "");
    numericValue = parseInt(cleanValue, 10) || 0;
    isCurrency = true;
  } else if (typeof value === "number") {
    numericValue = value;
  }

  const animatedCount = useCountUp(numericValue, 1500);

  const formatDisplay = () => {
    if (isCurrency) {
      // Format as currency
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(animatedCount || 0);
    }

    // Format as regular number with thousand separator
    return animatedCount.toLocaleString("vi-VN");
  };

  return (
    <div
      className={`bg-gradient-to-br ${bg} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition`}
    >
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-2xl font-bold mt-1 break-words">{formatDisplay()}</p>
    </div>
  );
}
