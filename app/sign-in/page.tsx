import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
};

// Phone OTP-only mode is configured in the Clerk Dashboard:
// Authentication > Email, Phone, Username > disable email and social,
// enable Phone number with OTP verification only.
export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm border-2 border-wire-border bg-wire-white p-8 rounded-sm">
        <h1 className="text-3xl font-bold mb-2 text-wire-text">Theater With a View</h1>
        <p className="text-wire-text-muted mb-6">Sign in with your phone number.</p>
        <SignInForm />
      </div>
    </main>
  );
}
