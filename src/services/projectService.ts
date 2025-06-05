export async function fetchProjects() {
  const response = await fetch("/api/projects");
  if (!response.ok) throw new Error("Error fetching projects");
  return response.json();
}
