const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

export const searchMeals = async (query) => {
  const res = await fetch(
    `${MEALDB_BASE}/search.php?s=${encodeURIComponent(query)}`,
  );

  if (!res.ok) {
    throw new Error("Could not reach the recipe API");
  }

  const data = await res.json();

  return data?.meals || [];
};