"use client";

import { useState, useTransition } from "react";
import { addBillAction } from "../actions/bill-actions";
import { suggestBillTypeAction } from "../actions/bill-suggestion-actions";
import {
  billTypeLabels,
  billTypes,
  suggestBillType,
} from "../lib/bills";
import type { BillType } from "@/app/types/types";
import SubmitButton from "./FormSubmitButton";

export function AddBill({
  date,
  redirectHref = "/dashboard/calender",
}: {
  date?: string;
  redirectHref?: string;
}) {
  const [selectedType, setSelectedType] = useState<BillType>("bill");
  const [suggestedType, setSuggestedType] = useState<BillType | null>(null);
  const [suggestionSource, setSuggestionSource] = useState<
    "keyword" | "ai" | "fallback" | null
  >(null);
  const [userSelectedType, setUserSelectedType] = useState(false);
  const [isSuggestingType, startTypeSuggestion] = useTransition();

  function handleNameChange(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setSuggestedType(null);
      return;
    }

    const nextSuggestedType = suggestBillType(trimmedName);
    setSuggestedType(nextSuggestedType);
    setSuggestionSource("keyword");

    if (!userSelectedType) {
      setSelectedType(nextSuggestedType);
    }
  }

  function handleNameBlur(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName || userSelectedType) {
      return;
    }

    startTypeSuggestion(async () => {
      const suggestion = await suggestBillTypeAction(trimmedName);

      setSuggestedType(suggestion.type);
      setSuggestionSource(suggestion.source);
      setSelectedType(suggestion.type);
    });
  }

  return (
    <section className="w-full rounded-lg bg-white p-6 text-gray-950 shadow-xl">
      <form
        action={addBillAction.bind(null, redirectHref)}
        className="space-y-4"
      >
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            type="text"
            required
            onChange={(event) => handleNameChange(event.target.value)}
            onBlur={(event) => handleNameBlur(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
          />
        </label>

        {suggestedType ? (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-950">
            {isSuggestingType ? "Checking AI suggestion..." : "Suggested type:"}{" "}
            <span className="font-semibold">{billTypeLabels[suggestedType]}</span>
            {suggestionSource ? (
              <span className="ml-1 text-xs text-blue-700">
                ({suggestionSource})
              </span>
            ) : null}
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium">Bill Amount:</span>
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
          />
        </label>

        <input type="hidden" name="date" value={date ?? ""} />

        <label className="block">
          <span className="text-sm font-medium">Type</span>
          <select
            name="type"
            value={selectedType}
            onChange={(event) => {
              setUserSelectedType(true);
              setSelectedType(event.target.value as BillType);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
          >
            {billTypes.map((type) => (
              <option key={type} value={type}>
                {billTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Repeat</span>

          <select
            name="recurrence"
            defaultValue="none"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>

        <SubmitButton
          pendingText="Adding bill..."
          className="w-full rounded-md bg-blue-950 px-4 py-2 font-semibold text-yellow-300 hover:bg-blue-900 disabled:opacity-50"
        >
          Add Bill
        </SubmitButton>
      </form>
    </section>
  );
}
