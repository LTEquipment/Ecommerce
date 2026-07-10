"use client";

import { useStore } from "./StoreProvider";
import { Check } from "./icons";

export default function Toast() {
  const { toastMsg } = useStore();
  return (
    <div className={`toast${toastMsg ? " show" : ""}`}>
      <Check />
      <span>{toastMsg}</span>
    </div>
  );
}
