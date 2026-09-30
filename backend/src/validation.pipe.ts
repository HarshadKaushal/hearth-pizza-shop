import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

type ParseResult =
  | { success: true; data: unknown }
  | { success: false; error: { issues: { message: string }[] } };

type Schema = {
  safeParse(value: unknown): ParseResult;
};

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: Schema) {}

  transform(value: unknown) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues.map((issue) => issue.message));
    }
    return parsed.data;
  }
}
