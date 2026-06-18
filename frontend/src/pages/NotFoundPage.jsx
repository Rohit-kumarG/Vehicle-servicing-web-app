import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="page-content">
      <div className="empty-state-card">
        <SearchX size={50} />
        <h1>Page not found</h1>
        <p>The page you requested does not exist in GARAGE WALA.</p>
        <a className="primary-button" href="/">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
