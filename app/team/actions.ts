"use server";

import { redirect } from "next/navigation";
import { passwordSignIn, signOut } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "/team/dashboard");
  if (!email || !password) return { error: "Enter your email and password." };
  const err = await passwordSignIn(email, password);
  if (err) return { error: err };
  redirect(next.startsWith("/team") || next.startsWith("/admin") ? next : "/team/dashboard");
}

export async function logout() {
  await signOut();
  redirect("/team");
}
