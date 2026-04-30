"use server";
import "server-only";
import { timingSafeEqual } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { TESTER_PHONE, TESTER_OTP, TEST_MODE } from "../config";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function checkIsTesterPhone(phone: string): Promise<boolean> {
  return TEST_MODE && TESTER_PHONE !== "" && safeEqual(phone, TESTER_PHONE);
}

export async function createTesterSession(
  phone: string,
  otp: string
): Promise<{ token: string } | { error: string }> {
  if (TESTER_PHONE === "" || !safeEqual(phone, TESTER_PHONE) || !safeEqual(otp, TESTER_OTP)) {
    return { error: "invalid credentials" };
  }

  try {
    // Look up Clerk user by phone number
    const client = await clerkClient();
    const users = await client.users.getUserList({ phoneNumber: [phone] });
    if (!users.data || users.data.length === 0) {
      console.error("[createTesterSession] No Clerk user found for tester phone");
      return { error: "invalid credentials" };
    }

    const userId = users.data[0].id;
    const tokenResult = await client.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 120,
    });

    return { token: tokenResult.token };
  } catch (err) {
    console.error("[createTesterSession] Clerk error:", err);
    return { error: "internal error" };
  }
}
