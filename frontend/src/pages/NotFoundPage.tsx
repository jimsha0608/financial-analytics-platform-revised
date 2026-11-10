import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="font-medium text-brand-600 hover:text-brand-700">
        Back to dashboard
      </Link>
    </div>
  );
}
