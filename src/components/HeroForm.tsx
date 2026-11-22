"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BirthForm from "@/components/BirthForm";
import { useSession } from "@/lib/hooks/useSession";
import { TEMP_KEY, computeChart, saveChart } from "@/lib/charts";
import type { BirthInput } from "@/lib/ziwei/types";

export default function HeroForm() {
  const router = useRouter();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(birth: BirthInput) {
    setLoading(true);
    setError("");
    try {
      const result = await computeChart(birth);
      if (session) {
        const id = await saveChart(session.user.id, { birth, result });
        router.push(`/la-so/${id}`);
      } else {
        sessionStorage.setItem(TEMP_KEY, JSON.stringify({ birth, result }));
        router.push("/la-so/tam");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }

  return <BirthForm onSubmit={submit} loading={loading} serverError={error} />;
}
