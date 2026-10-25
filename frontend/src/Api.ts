
const API_BASE_URL = "http://127.0.0.1:8000";

export interface DashboardData {
  total_documents: number;
  indexed_documents: number;
  total_insights: number;
  status: string;
}

export interface DocumentData {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  characters_extracted?: number;
}

export interface SearchResult {
  id: string;
  filename: string;
  file_type: string;
  snippet: string;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResult[];
}


export interface AskSource {
  id: string;
  filename: string;
  file_type: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: AskSource[];
  model: string;
}


async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return (
      data.detail ||
      data.message ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getDocuments(): Promise<DocumentData[]> {
  const response = await fetch(`${API_BASE_URL}/api/documents`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function uploadDocument(file: File): Promise<DocumentData> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function searchDocuments(
  query: string,
  limit: number = 10
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/search?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}


export async function askKnowledgebase(
  question: string
): Promise<AskResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}


export interface InsightData {
  document_id: string;
  filename: string;
  file_type: string;
  summary: string;
  key_points: string[];
  generated_at?: string;
}

export async function getInsights(): Promise<InsightData[]> {
  const response = await fetch(`${API_BASE_URL}/api/insights`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function generateInsight(
  documentId: string
): Promise<InsightData> {
  const response = await fetch(
    `${API_BASE_URL}/api/insights/${encodeURIComponent(documentId)}`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}


export async function deleteDocument(
  documentId: string
): Promise<{ message: string; document_id: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}
