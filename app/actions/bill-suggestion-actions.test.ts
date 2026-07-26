import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { suggestBillTypeAction } from "./bill-suggestion-actions";

describe("bill suggestion actions", () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "";
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    vi.unstubAllGlobals();
  });

  it("returns fallback purchase for blank names", async () => {
    await expect(suggestBillTypeAction("   ")).resolves.toEqual({
      type: "purchase",
      source: "fallback",
    });
  });

  it("returns keyword suggestions without calling AI", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(suggestBillTypeAction("wifi")).resolves.toEqual({
      type: "bill",
      source: "keyword",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back when no API key is configured", async () => {
    await expect(suggestBillTypeAction("corner store")).resolves.toEqual({
      type: "purchase",
      source: "fallback",
    });
  });

  it("returns a validated AI suggestion", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          output_text: '{"type":"bill"}',
        }),
      }),
    );

    await expect(suggestBillTypeAction("city water")).resolves.toEqual({
      type: "bill",
      source: "ai",
    });
  });

  it("falls back when AI returns an invalid type", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          output_text: '{"type":"subscription"}',
        }),
      }),
    );

    await expect(suggestBillTypeAction("unknown place")).resolves.toEqual({
      type: "purchase",
      source: "fallback",
    });
  });
});
