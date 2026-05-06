import { z } from 'zod';

export interface HalFormProperty {
  name: string;
  type: string;
  required: boolean;
  prompt: string;
}

export interface HalFormTemplate {
  title: string;
  method: string;
  action: string;
  contentType: string;
  properties: HalFormProperty[];
}

function resolveZodType(field: z.ZodTypeAny): string {
  if (field instanceof z.ZodOptional || field instanceof z.ZodNullable) {
    return resolveZodType(field.unwrap());
  }
  if (field instanceof z.ZodString) return 'text';
  if (field instanceof z.ZodNumber) return 'number';
  if (field instanceof z.ZodBoolean) return 'checkbox';
  return 'text';
}

function isOptional(field: z.ZodTypeAny): boolean {
  return field instanceof z.ZodOptional || field instanceof z.ZodNullable;
}

function getDescription(field: z.ZodTypeAny): string {
  const inner =
    field instanceof z.ZodOptional || field instanceof z.ZodNullable
      ? field.unwrap()
      : field;
  return (inner._def as { description?: string }).description ?? '';
}

export function zodToHalFormProperties(
  schema: z.ZodObject<z.ZodRawShape>,
): HalFormProperty[] {
  return Object.entries(schema.shape).map(([name, field]) => ({
    name,
    type: resolveZodType(field as z.ZodTypeAny),
    required: !isOptional(field as z.ZodTypeAny),
    prompt: getDescription(field as z.ZodTypeAny),
  }));
}
