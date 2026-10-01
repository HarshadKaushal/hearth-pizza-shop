import { suggestionSchema, type SuggestionValues } from "@hearth/shared";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../validation.pipe";
import { SuggestionsService } from "./suggestions.service";

@Controller("suggestions")
export class SuggestionsController {
  constructor(private readonly suggestions: SuggestionsService) {}

  @Post()
  @HttpCode(200)
  create(@Body(new ZodValidationPipe(suggestionSchema)) dto: SuggestionValues) {
    return this.suggestions.suggest(dto.prompt);
  }
}
