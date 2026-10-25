
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from "react";


import {
  getDashboard,
  getDocuments,
  searchDocuments,
  askKnowledgebase,
  uploadDocument,
  getInsights,
  generateInsight,
  deleteDocument,
  type DashboardData,
  type DocumentData,
  type SearchResult,
  type AskResponse,
  type InsightData,
} from "./Api";


type Page = "Dashboard" | "Documents" | "AI Assistant" | "Insights";

const pages: Page[] = [
  "Dashboard",
  "Documents",
  "AI Assistant",
  "Insights",
];

const initialDashboard: DashboardData = {
  total_documents: 0,
  indexed_documents: 0,
  total_insights: 0,
  status: "Connecting...",
};

const styles: Record<string, CSSProperties> = {

  app: {
    display: "flex",
    width: "100%",
    minHeight: "100dvh",
    margin: 0,
    background: "#F1F5F9",
    color: "#0F172A",
    fontFamily: 'Inter, "Segoe UI", Arial, Helvetica, sans-serif',
  },
  sidebar: {
    width: 250,
    flex: "0 0 250px",
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #172554 0%, #101D42 100%)",
    color: "#FFFFFF",
    padding: "26px 18px",
    boxSizing: "border-box",
  },
  main: {
    flex: "1 1 0",
    minWidth: 0,
    width: "calc(100% - 250px)",
    padding: "26px clamp(18px, 2.6vw, 42px)",
    boxSizing: "border-box",
    background: "#F1F5F9",
  },
  button: {
    border: 0,
    borderRadius: 8,
    padding: "11px 15px",
    background: "#2563EB",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  secondaryButton: {
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#FFFFFF",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 500,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    borderRadius: 12,
    padding: 22,
    marginBottom: 20,
    minWidth: 0,
    boxShadow: "0 3px 8px rgba(15, 23, 42, 0.05)",
  },
  muted: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.6,
  },
  notice: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 18,
    overflowWrap: "anywhere",
    fontSize: 14,
  },
  tableWrap: {
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 14,
    color: "#1E293B",
  },
  cell: {
    padding: 14,
    borderBottom: "1px solid #E2E8F0",
    verticalAlign: "top",
    color: "#1E293B",
  },
};

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [dashboard, setDashboard] =
    useState<DashboardData>(initialDashboard);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Milestone 4: keyword search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Milestone 5: local AI question answering
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<AskResponse | null>(null);
  const [askingAI, setAskingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  // Milestone 6: AI Insights state
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [generatingInsightId, setGeneratingInsightId] = useState<string | null>(null);

  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardData, documentData , insightData] = await Promise.all([
        getDashboard(),
        getDocuments(),
        getInsights(),
      ]);

      setDashboard(dashboardData);
      setDocuments(documentData);
      setInsights(insightData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleGenerateInsight = async (documentId: string) => {
    setGeneratingInsightId(documentId);
    setInsightsLoading(true);
    setInsightsError("");

    try {
      await generateInsight(documentId);
      const updatedInsights = await getInsights();
      setInsights(updatedInsights);
      await refreshData();
    } catch (err) {
      setInsightsError(
        err instanceof Error ? err.message : "Could not generate insight."
      );
    } finally {
      setGeneratingInsightId(null);
      setInsightsLoading(false);
    }
  };
  
async function handleDeleteDocument(
  documentId: string,
  filename: string
) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${filename}" and its saved insights? This cannot be undone.`
  );

  if (!confirmed) return;

  setDeletingDocumentId(documentId);
  setError("");
  setMessage("");

  try {
    await deleteDocument(documentId);

    setMessage(
      `Successfully deleted ${filename} and its associated insights.`
    );

    await refreshData();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Could not delete the document."
    );
  } finally {
    setDeletingDocumentId(null);
  }
}


  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  // Let the app use the full browser viewport instead of Vite's default centered layout.
  useEffect(() => {
    const previous = {
      bodyMargin: document.body.style.margin,
      bodyMinWidth: document.body.style.minWidth,
      rootWidth: document.getElementById("root")?.style.width ?? "",
      rootMaxWidth: document.getElementById("root")?.style.maxWidth ?? "",
      rootMargin: document.getElementById("root")?.style.margin ?? "",
      rootPadding: document.getElementById("root")?.style.padding ?? "",
    };
    const root = document.getElementById("root");
    document.body.style.margin = "0";
    document.body.style.minWidth = "320px";
    if (root) {
      root.style.width = "100%";
      root.style.maxWidth = "none";
      root.style.margin = "0";
      root.style.padding = "0";
    }
    return () => {
      document.body.style.margin = previous.bodyMargin;
      document.body.style.minWidth = previous.bodyMinWidth;
      if (root) {
        root.style.width = previous.rootWidth;
        root.style.maxWidth = previous.rootMaxWidth;
        root.style.margin = previous.rootMargin;
        root.style.padding = previous.rootPadding;
      }
    };
  }, []);

  function openFilePicker() {
    setError("");
    setMessage("");
    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["txt", "pdf", "docx", "csv", "html"].includes(extension ?? "")) {
      setError("Please select a PDF, TXT, DOCX, CSV, or HTML file.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage(`Uploading ${file.name}...`);

    try {
      const result = await uploadDocument(file);

      setMessage(
        `Successfully uploaded ${result.filename || file.name}.`
      );

      try {
        const [dashboardData, documentData] = await Promise.all([
          getDashboard(),
          getDocuments(),
        ]);

        setDashboard(dashboardData);
        setDocuments(documentData);
      } catch {
        setMessage(
          "Upload succeeded, but refreshing the data failed. Click Refresh to retry."
        );
      }

      setPage("Documents");
    } catch (err) {
      setMessage("");
      setError(
        err instanceof Error ? err.message : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleAskAI(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = aiQuestion.trim();

    if (!question) {
      setAiError("Please enter a question.");
      setAiResponse(null);
      return;
    }

    setAskingAI(true);
    setAiError("");
    setAiResponse(null);

    try {
      const response = await askKnowledgebase(question);
      setAiResponse(response);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Unable to get an AI answer. Please try again."
      );
    } finally {
      setAskingAI(false);
    }
  }

  const cardStyle: CSSProperties = {
    ...styles.card,
    flex: "1 1 170px",
  };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <h2 style={{ margin: "0 0 8px", fontSize: 24 }}>
          KnowledgeAI
        </h2>

        <p style={{ color: "#CBD5E1", fontSize: 12, lineHeight: 1.6 }}>
          Knowledgebase &amp; AI Insights
        </p>

        <nav aria-label="Main navigation" style={{ marginTop: 30 }}>
          {pages.map((item) => (
            <button
              key={item}
              onClick={() => setPage(item)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 10px",
                marginBottom: 8,
                border: 0,
                borderRadius: 8,
                color: "#FFFFFF",
                background:
                  page === item ? "#2563EB" : "transparent",
                fontWeight: page === item ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {item === "Dashboard" && "▦  "}
              {item === "Documents" && "▤  "}
              {item === "AI Assistant" && "✧  "}
              {item === "Insights" && "◈  "}
              {item}
            </button>
          ))}
        </nav>

      </aside>

      <main style={styles.main}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 26,
          }}
        >
          <div style={{ flex: "1 1 280px", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 29, color: "#0F172A" }}>
              {page}
            </h1>
            <p style={{ ...styles.muted, margin: 0 }}>
              {page === "Dashboard" && "knowledgebase overview."}
              {page === "Documents" && "Upload and manage  documents."}
              {page === "AI Assistant" && "Document question-and-answer workspace."}
              {page === "Insights" && "Explore insights from the knowledgebase."}
            </p>
          </div>

          <div
            role="status"
            aria-live="polite"
            title={loading ? "Checking backend connection" : `Backend status: ${dashboard.status}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 11px",
              border: "1px solid #CBD5E1",
              borderRadius: 999,
              background: "#FFFFFF",
              color: loading ? "#92400E" : error ? "#B91C1C" : "#166534",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: loading ? "#F59E0B" : error ? "#DC2626" : "#22C55E",
                boxShadow: `0 0 0 3px ${loading ? "#FEF3C7" : error ? "#FEE2E2" : "#DCFCE7"}`,
              }}
            />
            {loading ? "Connecting…" : error ? "Backend offline" : "Backend connected"}
          </div>

          {(page === "Dashboard" || page === "Documents") && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {page === "Documents" && (
                <button
                  style={styles.secondaryButton}
                  disabled={loading || uploading}
                  onClick={() => void refreshData()}
                >
                  {loading ? "Refreshing..." : "↻ Refresh"}
                </button>
              )}

              <button
                style={{
                  ...styles.button,
                  opacity: uploading ? 0.65 : 1,
                }}
                disabled={uploading}
                onClick={openFilePicker}
              >
                {uploading ? "Uploading..." : "+ Upload document"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx,.csv,.html,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/html"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </div>
          )}
        </header>

        {error && (
          <div
            role="alert"
            style={{
              ...styles.notice,
              background: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
            }}
          >
            <strong>Error:</strong> {error}
            <p style={{ marginBottom: 0 }}>
              Check that the backend is running at{" "}
              <code>http://127.0.0.1:8000</code>.
            </p>
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              ...styles.notice,
              background: uploading ? "#EFF6FF" : "#F0FDF4",
              color: uploading ? "#1D4ED8" : "#166534",
              border: `1px solid ${uploading ? "#BFDBFE" : "#BBF7D0"}`,
            }}
          >
            {message}
          </div>
        )}

        {page === "Dashboard" && (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={cardStyle}>
                <p style={{ ...styles.muted, margin: 0 }}>
                  Total documents
                </p>
                <h2
                  style={{
                    color: "#1D4ED8",
                    fontSize: 36,
                    fontWeight: 700,
                    margin: "14px 0 0",
                  }}
                >
                  {loading ? "…" : dashboard.total_documents}
                </h2>
              </div>

              <div style={cardStyle}>
                <p style={{ ...styles.muted, margin: 0 }}>
                  Indexed documents
                </p>
                <h2
                  style={{
                    color: "#15803D",
                    fontSize: 36,
                    fontWeight: 700,
                    margin: "14px 0 0",
                  }}
                >
                  {loading ? "…" : dashboard.indexed_documents}
                </h2>
              </div>

              <div style={cardStyle}>
                <p style={{ ...styles.muted, margin: 0 }}>
                  AI insights
                </p>
                <h2
                  style={{
                    color: "#7C3AED",
                    fontSize: 36,
                    fontWeight: 700,
                    margin: "14px 0 0",
                  }}
                >
                  {loading ? "…" : dashboard.total_insights}
                </h2>
              </div>


            </div>

            <section style={styles.card}>
              <h2 style={{ fontSize: 20, color: "#0F172A" }}>
                Recent documents
              </h2>
              <DocumentTable 
              documents={documents.slice(0, 5)}
              loading={loading}
              onGenerateInsight={handleGenerateInsight}
              generatingInsightId={generatingInsightId}
              onDeleteDocument={handleDeleteDocument}
              deletingDocumentId={deletingDocumentId}
            />
              <button
                style={{ ...styles.secondaryButton, marginTop: 16 }}
                onClick={() => setPage("Documents")}
              >
                View all documents →
              </button>
            </section>
          </>
        )}

        {page === "Documents" && (
          <section style={styles.card}>
            <h2 style={{ fontSize: 21, color: "#0F172A" }}>
              Your documents
            </h2>
            <p style={styles.muted}>
              {documents.length} document
              {documents.length === 1 ? "" : "s"} listed
            </p>
             <DocumentTable
               documents={documents}
               loading={loading}
               onGenerateInsight={handleGenerateInsight}
               generatingInsightId={generatingInsightId}
               onDeleteDocument={handleDeleteDocument}
               deletingDocumentId={deletingDocumentId}
              />


            <p style={styles.muted}>
              Supported formats: PDF, TXT, DOCX, CSV, and HTML.
            </p>
          </section>
        )}

        {page === "AI Assistant" && (
          <>
            <section style={styles.card}>
              <h2 style={{ color: "#0F172A", marginTop: 0 }}>
                Search your knowledgebase
              </h2>
              <p style={styles.muted}>
                Search the text extracted from  uploaded documents.
              </p>

              <form
                onSubmit={async (event) => {
                  event.preventDefault();

                  const query = searchQuery.trim();
                  if (!query) {
                    setSearchError("Enter a word or phrase to search for.");
                    setSearchResults([]);
                    setSearchCount(null);
                    setHasSearched(false);
                    return;
                  }

                  setSearching(true);
                  setSearchError("");
                  setMessage("");
                  setHasSearched(true);

                  try {
                    const response = await searchDocuments(query, 10);
                    setSearchResults(response.results);
                    setSearchCount(response.total_results);
                  } catch (err) {
                    setSearchResults([]);
                    setSearchCount(null);
                    setSearchError(
                      err instanceof Error
                        ? err.message
                        : "Search failed. Please try again."
                    );
                  } finally {
                    setSearching(false);
                  }
                }}
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 18,
                }}
              >
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Try a word such as course or disaster"
                  aria-label="Search document contents"
                  maxLength={200}
                  style={{
                    flex: "1 1 260px",
                    minWidth: 0,
                    padding: "12px 14px",
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    color: "#0F172A",
                    background: "#FFFFFF",
                    fontSize: 15,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    opacity: searching ? 0.65 : 1,
                  }}
                  disabled={searching}
                >
                  {searching ? "Searching..." : "Search documents"}
                </button>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  disabled={searching && !searchQuery}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setSearchCount(null);
                    setSearchError("");
                    setHasSearched(false);
                  }}
                >
                  Clear
                </button>
              </form>

              <p style={{ ...styles.muted, fontSize: 12, marginBottom: 0 }}>
                Search is case-insensitive. Results show documents containing
                the exact word or phrase.
              </p>
            </section>

            {searchError && (
              <div
                role="alert"
                style={{
                  ...styles.notice,
                  background: "#FEF2F2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                }}
              >
                <strong>Search error:</strong> {searchError}
              </div>
            )}

            {hasSearched && !searchError && (
              <section style={styles.card}>
                <h2 style={{ color: "#0F172A", marginTop: 0 }}>
                  Search results
                </h2>

                {searching ? (
                  <p style={styles.muted}>Searching your documents...</p>
                ) : (
                  <p style={styles.muted}>
                    {searchCount ?? 0} matching document
                    {searchCount === 1 ? "" : "s"} for{" "}
                    <strong>{searchQuery.trim()}</strong>
                  </p>
                )}

                {!searching && searchResults.length === 0 && (
                  <p style={styles.muted}>
                    No matching documents found. Try another word or phrase.
                  </p>
                )}

                <div style={{ display: "grid", gap: 14 }}>
                  {searchResults.map((result) => (
                    <article
                      key={result.id}
                      style={{
                        border: "1px solid #CBD5E1",
                        borderRadius: 10,
                        padding: 16,
                        background: "#F8FAFC",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <strong
                          style={{
                            color: "#1D4ED8",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {result.filename}
                        </strong>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#334155",
                            background: "#E2E8F0",
                            padding: "4px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {(result.file_type || "file").toUpperCase()}
                        </span>
                      </div>

                      <p
                        style={{
                          color: "#334155",
                          fontSize: 14,
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                          marginBottom: 10,
                        }}
                      >
                        {result.snippet}
                      </p>

                      <details>
                        <summary
                          style={{
                            color: "#475569",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Show document ID
                        </summary>
                        <code
                          style={{
                            display: "block",
                            marginTop: 8,
                            fontSize: 12,
                            overflowWrap: "anywhere",
                            color: "#334155",
                          }}
                        >
                          {result.id}
                        </code>
                      </details>
                    </article>
                  ))}
                </div>
              </section>
            )}
            <section style={styles.card}>
              <h2 style={{ color: "#0F172A", marginTop: 0 }}>
                Ask AI about your documents
              </h2>
              <p style={styles.muted}>
                Ask a question in natural language. KnowledgeAI searches the
                uploaded documents and uses  local AI model to generate an answer.
              </p>

              <form
                onSubmit={handleAskAI}
                style={{ display: "grid", gap: 12, marginTop: 18 }}
              >
                <textarea
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  placeholder="Example: What is KnowledgeAI used for?"
                  aria-label="Ask a question about your documents"
                  maxLength={1000}
                  rows={3}
                  disabled={askingAI}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 14,
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    color: "#0F172A",
                    background: "#FFFFFF",
                    fontSize: 15,
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={askingAI}
                    style={{ ...styles.button, opacity: askingAI ? 0.65 : 1 }}
                  >
                    {askingAI ? "Generating answer..." : "✧ Ask AI"}
                  </button>
                  <button
                    type="button"
                    disabled={askingAI}
                    style={styles.secondaryButton}
                    onClick={() => {
                      setAiQuestion("");
                      setAiResponse(null);
                      setAiError("");
                    }}
                  >
                    Clear
                  </button>
                </div>
              </form>

              {askingAI && (
                <p role="status" style={styles.muted}>
                  The local AI is preparing an answer. This may take a little time.
                </p>
              )}

              {aiError && (
                <div
                  role="alert"
                  style={{
                    ...styles.notice,
                    marginTop: 18,
                    marginBottom: 0,
                    background: "#FEF2F2",
                    color: "#991B1B",
                    border: "1px solid #FECACA",
                  }}
                >
                  <strong>AI error:</strong> {aiError}
                </div>
              )}

              {aiResponse && (
                <div
                  style={{
                    marginTop: 22,
                    padding: 18,
                    border: "1px solid #BFDBFE",
                    borderRadius: 10,
                    background: "#F8FAFC",
                  }}
                >
                  <p style={{ color: "#475569", fontSize: 13, marginTop: 0 }}>
                    Answer to: <strong>{aiResponse.question}</strong>
                  </p>
                  <h3 style={{ color: "#1D4ED8", marginBottom: 10 }}>AI Answer</h3>
                  <p
                    style={{
                      color: "#1E293B",
                      fontSize: 15,
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {aiResponse.answer}
                  </p>
                  <h3 style={{ color: "#0F172A", marginTop: 22 }}>Source documents</h3>
                  {aiResponse.sources.length === 0 ? (
                    <p style={styles.muted}>No source documents were returned.</p>
                  ) : (
                    <ul style={{ paddingLeft: 22, color: "#334155", lineHeight: 1.9 }}>
                      {aiResponse.sources.map((source) => (
                        <li key={source.id} style={{ overflowWrap: "anywhere" }}>
                          <strong>{source.filename}</strong>{" "}
                          <span style={{ fontSize: 12 }}>
                            ({source.file_type.toUpperCase()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p style={{ ...styles.muted, fontSize: 12, marginBottom: 0 }}>
                    Local model: {aiResponse.model}. Verify important answers against
                    the original documents.
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {page === "Insights" && (
          <section style={styles.card}>
            <h2 style={{ color: "#0F172A" }}>AI Insights</h2>
            <p style={styles.muted}>
              Generate summaries and key points from  uploaded documents.
            </p>
            {insightsLoading && (
              <p style={styles.muted}>Loading insights...</p>
            )}
            {insightsError && (
              <p style={{ color: "#DC2626" }}>{insightsError}</p>
            )}
            {!insightsLoading && insights.length === 0 && (
              <p style={styles.muted}>
                No insights have been generated yet.
                Open Documents and generate an insight for a document.
              </p>
            )}
            {insights.map((insight) => (
              <article
                key={insight.document_id}
                style={{
                 border: "1px solid #CBD5E1",
                 borderRadius: 10,
                 padding: 16,
                 marginTop: 14,
                 textAlign: "left",
              }}
             >
              <h3>{insight.filename}</h3>

              <p>
                <strong>Summary:</strong> {insight.summary}
              </p>
            {insight.key_points.length > 0 && (
              <>
                <strong>Key points:</strong>
                <ul>
                  {insight.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
              ))}
            </ul>
          </>
        )}
        <p style={styles.muted}>
          Generated: {insight.generated_at}
        </p>
      </article>
    ))}
  </section>
)}
      </main>
    </div>
  );
}

function getFileTypeLabel(fileType?: string): string {
  const type = (fileType || "").toLowerCase().replace(/^\\./, "");
  const labels: Record<string, string> = {
    pdf: "PDF",
    txt: "TXT",
    docx: "DOCX",
    csv: "CSV",
    html: "HTML",
  };
  return labels[type] || (type ? type.toUpperCase().slice(0, 8) : "FILE");
}

function getFileTypeColors(fileType?: string): {
  background: string;
  border: string;
  text: string;
} {
  const type = (fileType || "").toLowerCase().replace(/^\\./, "");
  const palette: Record<string, { background: string; border: string; text: string }> = {
    pdf: { background: "#FEF2F2", border: "#FECACA", text: "#B91C1C" },
    txt: { background: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
    docx: { background: "#EEF2FF", border: "#C7D2FE", text: "#4338CA" },
    csv: { background: "#F0FDF4", border: "#BBF7D0", text: "#15803D" },
    html: { background: "#FFF7ED", border: "#FED7AA", text: "#C2410C" },
  };
  return palette[type] || {
    background: "#F1F5F9",
    border: "#CBD5E1",
    text: "#475569",
  };
}

function DocumentTable({
  documents,
  loading,
  onGenerateInsight,
  generatingInsightId,
  onDeleteDocument,
  deletingDocumentId,
}: {
  documents: DocumentData[];
  loading: boolean;
  onGenerateInsight: (documentId: string) => Promise<void>;
  generatingInsightId: string | null;
  onDeleteDocument: (documentId: string, filename: string) => Promise<void>;
  deletingDocumentId: string | null;
}) {
  if (loading) {
    return <p style={styles.muted}>Loading documents...</p>;
  }

  if (documents.length === 0) {
    return (
      <p style={styles.muted}>
        No documents yet. Click Upload document to add a supported file.
      </p>
    );
  }

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {["Filename", "Type", "Status", "ID", "Action"].map((heading) => (
              <th
                key={heading}
                style={{
                  ...styles.cell,
                  color: "#334155",
                  background: "#F8FAFC",
                  fontWeight: 700,
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {documents.map((document, index) => (
            <tr key={`${document.id}-${index}`}>
              <td style={styles.cell}>
                <strong style={{ color: "#0F172A" }}>
                  {document.filename}
                </strong>
                {typeof document.characters_extracted === "number" && (
                  <div style={{ ...styles.muted, fontSize: 12 }}>
                    {document.characters_extracted.toLocaleString()} characters
                  </div>
                )}
              </td>

              <td style={styles.cell}>
                <span
                  title={`${(document.file_type || "file").toUpperCase()} document`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 58,
                    padding: "5px 9px",
                    borderRadius: 999,
                    border: `1px solid ${
                      getFileTypeColors(document.file_type).border
                    }`,
                    background: getFileTypeColors(document.file_type).background,
                    color: getFileTypeColors(document.file_type).text,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 0.45,
                  }}
                >
                  {getFileTypeLabel(document.file_type)}
                </span>
              </td>

              <td style={styles.cell}>
                <span
                  style={{
                    color:
                      document.status?.toLowerCase() === "processed"
                        ? "#15803D"
                        : "#334155",
                    fontWeight: 600,
                  }}
                >
                  {document.status || "—"}
                </span>
              </td>

              <td
                style={{
                  ...styles.cell,
                  maxWidth: 160,
                  overflowWrap: "anywhere",
                  fontSize: 12,
                }}
              >
                {document.id}
              </td>

              <td style={styles.cell}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 8,
                    minWidth: 112,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      ...styles.secondaryButton,
                      whiteSpace: "normal",
                    }}
                    disabled={
                      generatingInsightId !== null ||
                      deletingDocumentId !== null ||
                      document.status?.toLowerCase() !== "processed"
                    }
                    onClick={() => void onGenerateInsight(document.id)}
                  >
                    {generatingInsightId === document.id
                      ? "Generating..."
                      : "Generate Insight"}
                  </button>

                  <button
                    type="button"
                    style={{
                      ...styles.secondaryButton,
                      border: "1px solid #FCA5A5",
                      background: "#FEF2F2",
                      color: "#B91C1C",
                      whiteSpace: "normal",
                      opacity: deletingDocumentId !== null ? 0.65 : 1,
                      cursor: deletingDocumentId !== null ? "not-allowed" : "pointer",
                    }}
                    disabled={
                      deletingDocumentId !== null ||
                      generatingInsightId !== null
                    }
                    onClick={() =>
                      void onDeleteDocument(document.id, document.filename)
                    }
                  >
                    {deletingDocumentId === document.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;
