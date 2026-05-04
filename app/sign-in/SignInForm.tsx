"use client";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { checkIsTesterPhone, createTesterSession } from "@/lib/actions/testerSignIn";
import { registerWithInvite } from "@/lib/actions/registerWithInvite";
import { normalizePhone } from "@/lib/phone";

type Phase = "phone" | "otp" | "invite";

export default function SignInForm() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  const destination = redirectUrl?.startsWith("/") ? redirectUrl : "/suggest";
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isTester, setIsTester] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setError(null);
    setLoading(true);
    const normalized = normalizePhone(phone);
    if (normalized !== phone) setPhone(normalized);
    try {
      const tester = await checkIsTesterPhone(normalized);
      if (tester) {
        setIsTester(true);
        setPhase("otp");
        return;
      }
      const { error: createError } = await signIn.create({ identifier: normalized });
      if (createError) throw new Error(createError.longMessage ?? createError.message);
      const { error: sendError } = await signIn.phoneCode.sendCode({ phoneNumber: normalized });
      if (sendError) throw new Error(sendError.longMessage ?? sendError.message);
      setPhase("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setError(null);
    setLoading(true);
    try {
      if (isTester) {
        const testerResult = await createTesterSession(phone, otp);
        if ("error" in testerResult) {
          setError(testerResult.error === "invalid credentials" ? "Invalid OTP" : "Sign-in failed");
          return;
        }
        const { error: ticketError } = await signIn.create({ strategy: "ticket", ticket: testerResult.token });
        if (ticketError) throw new Error(ticketError.longMessage ?? ticketError.message);
      } else {
        const { error: verifyError } = await signIn.phoneCode.verifyCode({ code: otp });
        if (verifyError) throw new Error(verifyError.longMessage ?? verifyError.message);
      }
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) throw new Error(finalizeError.longMessage ?? finalizeError.message);
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const normalized = normalizePhone(phone);
    if (normalized !== phone) setPhone(normalized);
    try {
      const result = await registerWithInvite(normalized, inviteCode);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setRegistrationSuccess(true);
      setInviteCode("");
      setPhase("phone");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border-2 border-wire-border bg-wire-white px-3 py-2 min-h-[44px] rounded-sm text-wire-text focus:outline-none focus:border-wire-text";
  const buttonClass =
    "w-full border-2 border-wire-border bg-wire-surface-2 px-3 py-2 min-h-[44px] rounded-sm text-wire-text font-bold disabled:opacity-50";

  return (
    <form
      onSubmit={
        phase === "phone"
          ? handlePhoneSubmit
          : phase === "invite"
            ? handleInviteSubmit
            : handleOtpSubmit
      }
      noValidate
    >
      {phase === "phone" ? (
        <div className="flex flex-col gap-4">
          {registrationSuccess && (
            <p className="text-wire-text-muted text-sm">
              Account created! Send yourself a code to sign in.
            </p>
          )}
          <label className="flex flex-col gap-1 text-wire-text font-bold">
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15555550100"
              required
              autoComplete="tel"
              className={inputClass}
            />
          </label>
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <button type="submit" disabled={loading || !phone} className={buttonClass}>
            {loading ? "Checking…" : "Send code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("invite");
              setError(null);
              setRegistrationSuccess(false);
            }}
            className="text-wire-text-muted text-sm underline"
          >
            Have an invite code?
          </button>
        </div>
      ) : phase === "invite" ? (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-wire-text font-bold">
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15555550100"
              required
              autoComplete="tel"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-wire-text font-bold">
            Invite code
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              required
              autoComplete="off"
              className={inputClass}
            />
          </label>
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <button type="submit" disabled={loading || !phone || !inviteCode} className={buttonClass}>
            {loading ? "Creating account…" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("phone");
              setError(null);
              setInviteCode("");
            }}
            className="text-wire-text-muted text-sm underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-wire-text-muted text-sm">
            {isTester ? "Enter your tester OTP." : `Enter the code sent to ${phone}.`}
          </p>
          <label className="flex flex-col gap-1 text-wire-text font-bold">
            One-time code
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              required
              autoComplete="one-time-code"
              className={inputClass}
            />
          </label>
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <button type="submit" disabled={loading || !otp} className={buttonClass}>
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("phone");
              setOtp("");
              setError(null);
              setIsTester(false);
              setRegistrationSuccess(false);
            }}
            className="text-wire-text-muted text-sm underline"
          >
            Use a different number
          </button>
        </div>
      )}
    </form>
  );
}
