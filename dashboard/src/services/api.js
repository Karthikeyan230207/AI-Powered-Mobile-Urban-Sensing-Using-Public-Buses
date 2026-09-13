const API_BASE_URL = "http://127.0.0.1:8000";

export async function getIncidents(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.append("status", filters.status);
  }

  if (filters.severity) {
    params.append("severity", filters.severity);
  }

  if (filters.incident_type) {
    params.append("incident_type", filters.incident_type);
  }

  const query = params.toString();

  const url = `${API_BASE_URL}/api/incidents${
    query ? `?${query}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch incidents: ${response.status}`);
  }

  return response.json();
}

export async function getDashboardStats() {
  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/stats`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard stats: ${response.status}`
    );
  }

  return response.json();
}

export { API_BASE_URL };