"use server";
import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { TESTER_PHONE, TESTER_OTP } from "../config";

export async function checkIsTesterPhone(phone: string): Promise<boolean> {
  return TESTER_PHONE !== "" && phone === TESTER_PHONE;
}

export async function createTesterSession(
  phone: string,
  otp: string
): Promise<{ token: string } | { error: string }> {
  if (TESTER_PHONE === "" || phone !== TESTER_PHONE || otp !== TESTER_OTP) {
    return { error: "invalid credentials" };
  }

  // Look up Clerk user by phone number
  const client = await clerkClient();
  const users = await client.users.getUserList({ phoneNumber: [phone] });
  if (!users.data || users.data.length === 0) {
    return { error: "user not found" };
  }

  const userId = users.data[0].id;
  const tokenResult = await client.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 120,
  });

  return { token: tokenResult.token };
}
