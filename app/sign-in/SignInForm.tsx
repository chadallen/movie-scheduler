"use client";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { checkIsTesterPhone, createTesterSession } from "@/lib/actions/testerSignIn";

type Phase = "phone" | "otp";

export default function SignInForm() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isTester, setIsTester] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn || !signUp) return;
    setError(null);
    setLoading(true);
    try {
      const tester = await checkIsTesterPhone(phone);
      if (tester) {
        setIsTester(true);
        setPhase("otp");
        return;
      }

      try {
        await signIn.create({ identifier: phone });
        await signIn.phoneCode.sendCode({ phoneNumber: phone });
        setIsSignUp(false);
      } catch (err: any) {
        // Account doesn't exist yet — create one and send sign-up OTP
        if (err?.errors?.[0]?.code === "form_identifier_not_found") {
          const createResult = await signUp.create({ phoneNumber: phone });
          console.log('[sign-up] create result:', createResult);
          console.log('[sign-up] signUp after create:', signUp);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const su = signUp as any;
          console.log('[sign-up] preparePhoneNumberVerification type:', typeof su.preparePhoneNumberVerification);
          console.log('[sign-up] available methods:', Object.keys(su).filter(k => typeof su[k] === 'function'));
          if (createResult.error) {
            throw new Error(createResult.error.longMessage ?? createResult.error.message ?? "Failed to create account");
          }
          if (typeof su.preparePhoneNumberVerification === 'function') {
            const prepResult = await su.preparePhoneNumberVerification({ strategy: "phone_code" });
            console.log('[sign-up] preparePhoneNumberVerification result:', prepResult);
            if (prepResult?.error) {
              throw new Error(prepResult.error.longMessage ?? prepResult.error.message ?? "Failed to send code");
            }
          } else {
            console.log('[sign-up] preparePhoneNumberVerification not available, signUp.status:', su.status);
          }
          setIsSignUp(true);
        } else {
          throw err;
        }
      }
      setPhase("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isTester) {
        if (!signIn) return;
        const result = await createTesterSession(phone, otp);
        if ("error" in result) {
          setError(result.error === "invalid credentials" ? "Invalid OTP" : "Sign-in failed");
          return;
        }
        const ticketResult = await signIn.ticket({ ticket: result.token });
        if (ticketResult.error) {
          throw new Error(ticketResult.error.longMessage ?? ticketResult.error.message ?? "Ticket sign-in failed");
        }
        await signIn.finalize();
      } else if (isSignUp) {
        if (!signUp || !setActive) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (signUp as any).attemptPhoneNumberVerification({ code: otp });
        if (result.status !== "complete") {
          throw new Error("Verification failed");
        }
        await setActive({ session: result.createdSessionId });
      } else {
        if (!signIn) return;
        await signIn.phoneCode.verifyCode({ code: otp });
        await signIn.finalize();
      }
      router.push("/suggest");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border-2 border-wire-border bg-wire-white px-3 py-2 min-h-[44px] rounded-sm text-wire-text focus:outline-none focus:border-wire-text";
  const buttonClass =
    "w-full border-2 border-wire-border bg-wire-gray px-3 py-2 min-h-[44px] rounded-sm text-wire-text font-bold disabled:opacity-50";

  return (
    <form onSubmit={phase === "phone" ? handlePhoneSubmit : handleOtpSubmit} noValidate>
      {phase === "phone" ? (
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
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <button type="submit" disabled={loading || !phone} className={buttonClass}>
            {loading ? "Checking…" : "Send code"}
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
              setIsSignUp(false);
              setIsTester(false);
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
