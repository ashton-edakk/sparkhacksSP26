export async function searchVideos(query) {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Search failed");
  }

  return res.json();
}
