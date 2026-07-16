"use client";

import { useStore } from "./StoreProvider";
import { Check, AlertTriangle } from "./icons";

export default function Toast() {
  const { toastMsg, toastKind } = useStore();
  const isErr = toastKind === "error";
  return (
    <div
      className={`toast${toastMsg ? " show" : ""}${isErr ? " err" : ""}`}
      role={isErr ? "alert" : "status"}
      aria-live={isErr ? "assertive" : "polite"}
    >
      {isErr ? <AlertTriangle /> : <Check />}
      <span>{toastMsg}</span>
    </div>
  );
}
