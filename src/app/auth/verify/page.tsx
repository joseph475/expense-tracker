import { Mail } from "lucide-react";

export const metadata = { title: "Check your email — Expense Tracker" };

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center space-y-4">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-indigo-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
        <p className="text-sm text-gray-500">
          We sent you a confirmation link. Click it to activate your account,
          then come back to sign in.
        </p>
        <a
          href="/auth"
          className="inline-block mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back to sign in
        </a>
      </div>
    </div>
  );
}
