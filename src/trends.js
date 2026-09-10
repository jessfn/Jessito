// Obtiene los temas en tendencia del dia en Mexico usando el endpoint publico
// (no oficial, sin API key) de Google Trends. Si falla, regresa una lista vacia
// y el llamador debe usar un tema normal como respaldo.
export async function fetchTrendingTopicsMX() {
  try {
    const res = await fetch(
      "https://trends.google.com/trends/api/dailytrends?hl=es-MX&tz=-360&geo=MX&ns=15"
    );
    if (!res.ok) return [];

    const raw = await res.text();
    // La respuesta viene con un prefijo de seguridad ")]}',\n" que hay que quitar.
    const json = JSON.parse(raw.replace(/^\)\]\}'\n/, ""));

    const days = json.default?.trendingSearchesDays ?? [];
    const searches = days[0]?.trendingSearches ?? [];

    return searches.map((s) => s.title?.query).filter(Boolean);
  } catch {
    return [];
  }
}
