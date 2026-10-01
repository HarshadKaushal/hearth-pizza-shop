import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { interpretSuggestion, ModelSuggestion } from "./interpret";

const REFUSAL_RULES = [
  "You are the pizza builder for Hearth, a single pizza shop.",
  "You do only one job: choose one pizza from the menu list in the user message.",
  "If the message is not a request for a pizza — including homework, weather, jokes, other restaurants, code, or any question that is not about how a pizza should taste — set refused to true, size to MEDIUM, and ingredientIds to an empty array.",
  "Do not answer that off-topic message. Do not explain, apologize at length, or add any sentence.",
  "If it is a pizza request, set refused to false. Use only ids from the menu. Pick exactly one crust, one sauce, and one cheese, and at most eight toppings.",
  "Match taste words to those menu rows: spicy toward jalapeños, crispy toward a thin crust, cheesy toward a cheese, mushroomy toward mushrooms.",
  "Use MEDIUM unless the message asks for a small or a large pizza.",
].join(" ");

@Injectable()
export class SuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async suggest(prompt: string) {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) {
      throw new ServiceUnavailableException(
        "Pizza suggestions are off until a Gemini API key is set. The buttons below still build a pizza.",
      );
    }

    const catalog = await this.prisma.ingredient.findMany({
      where: { available: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    const model = await this.askGemini(key, prompt, catalog);
    const interpreted = interpretSuggestion(model, catalog);
    if (!interpreted.ok) {
      throw new BadRequestException(interpreted.message);
    }
    return {
      size: interpreted.size,
      ingredientIds: interpreted.ingredientIds,
      label: interpreted.label,
    };
  }

  private async askGemini(
    key: string,
    prompt: string,
    catalog: { id: string; name: string; category: string; description: string }[],
  ): Promise<ModelSuggestion> {
    const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
    const menu = catalog
      .map((row) => `${row.id} | ${row.category} | ${row.name} | ${row.description}`)
      .join("\n");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: REFUSAL_RULES }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Customer message:\n${prompt}\n\nMenu (id | category | name | description):\n${menu}` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 300,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                refused: { type: "BOOLEAN" },
                size: { type: "STRING", enum: ["SMALL", "MEDIUM", "LARGE"] },
                ingredientIds: { type: "ARRAY", items: { type: "STRING" } },
              },
              required: ["refused", "size", "ingredientIds"],
            },
          },
        }),
      });
    } catch {
      throw new BadGatewayException("The pizza suggestion could not be reached. Build the pizza with the buttons.");
    }

    if (response.status === 429) {
      throw new ServiceUnavailableException(
        "The free suggestion limit is used up for now. Build the pizza with the buttons.",
      );
    }
    if (!response.ok) {
      throw new BadGatewayException("The pizza suggestion could not be reached. Build the pizza with the buttons.");
    }

    const body = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = body.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) {
      return { refused: true };
    }

    try {
      return suggestionPayload(text);
    } catch {
      return { refused: true };
    }
  }
}

function suggestionPayload(text: string): ModelSuggestion {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    return { refused: true };
  }
  const record = parsed as ModelSuggestion;
  return {
    refused: record.refused === true,
    size: typeof record.size === "string" ? record.size : undefined,
    ingredientIds: record.ingredientIds,
  };
}
