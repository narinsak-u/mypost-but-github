"use client";

import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center gap-6">
      {mode === "sign-in" ? (
        <SignInForm onToggleMode={() => setMode("sign-up")} />
      ) : (
        <SignUpForm onToggleMode={() => setMode("sign-in")} />
      )}
    </div>
  );
}
