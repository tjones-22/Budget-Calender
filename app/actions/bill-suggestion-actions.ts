"use server";

import type { BillType } from "@/types/types";
import {
  billTypeLabels,
  isBillType,
  suggestBillType,
  suggestBillTypeFromKeywords,
} from "../lib/bills";

type BillTypeSuggestion = {
  type: BillType;
  source: "keyword" | "ai" | "fallback";
};

function getResponseText(responseData: unknown) {
  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "output_text" in responseData &&
    typeof responseData.output_text === "string"
  ) {
    return responseData.output_text;
  }

  return "";
}

function parseBillTypeSuggestion(responseText: string) {
  const trimmedResponse = responseText.trim().toLowerCase();

  if (isBillType(trimmedResponse)) {
    return trimmedResponse;
  }

  try {
    const parsedResponse = JSON.parse(responseText) as { type?: unknown };

    if (typeof parsedResponse.type === "string" && isBillType(parsedResponse.type)) {
      return parsedResponse.type;
    }
  } catch {
    return null;
  }

  return null;
}

export async function suggestBillTypeAction(
  name: string,
): Promise<BillTypeSuggestion> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      type: "purchase",
      source: "fallback",
    };
  }

  const keywordSuggestion = suggestBillTypeFromKeywords(trimmedName);

  if (keywordSuggestion) {
    return {
      type: keywordSuggestion,
      source: "keyword",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      type: suggestBillType(trimmedName),
      source: "fallback",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        input: [
          {
            role: "system",
            content:
              "Classify budget item names into exactly one type. Valid types: payday, bill, purchase, savings. Return only JSON like {\"type\":\"bill\"}.",
          },
          {
            role: "user",
            content: `Item name: ${trimmedName}\nLabels:\n${Object.entries(
              billTypeLabels,
            )
              .map(([type, label]) => `- ${type}: ${label}`)
              .join("\n")}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        type: suggestBillType(trimmedName),
        source: "fallback",
      };
    }

    const responseData = (await response.json()) as unknown;
    const aiSuggestion = parseBillTypeSuggestion(getResponseText(responseData));

    if (!aiSuggestion) {
      return {
        type: suggestBillType(trimmedName),
        source: "fallback",
      };
    }

    return {
      type: aiSuggestion,
      source: "ai",
    };
  } catch {
    return {
      type: suggestBillType(trimmedName),
      source: "fallback",
    };
  }
}
