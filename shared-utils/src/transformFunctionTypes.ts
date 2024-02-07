import z from "zod";

const ZArgumentsRepresentation = z.union([
  z.string(),
  z.boolean(),
  z.string().array(),
  z.number(),
  z.number().array(),
]);

export type ArgumentsRepresentation = z.infer<typeof ZArgumentsRepresentation>;

// zod recursive types: https://github.com/colinhacks/zod#recursive-types
// basically, you have to type hint to zod what the type is, and then use z.lazy to tell zod to use that type
// modify the base model to add fields
// extend to add recursive fields
const baseZTransformFunctionGQLRepresentation = z.object({
  functionID: z.string(),
});

export type TransformFunctionGQLRepresentation = z.infer<
  typeof baseZTransformFunctionGQLRepresentation
> & {
  arguments: (TransformFunctionGQLRepresentation | ArgumentsRepresentation)[];
};

export const ZTransformFunctionGQLRepresentation: z.ZodType<TransformFunctionGQLRepresentation> =
  baseZTransformFunctionGQLRepresentation.extend({
    arguments: z.lazy(() =>
      z
        .union([ZTransformFunctionGQLRepresentation, ZArgumentsRepresentation])
        .array()
    ),
  });

const baseZTransformFunctionDatabaseRepresentation = z.object({
  functionID: z.string(),
  functionInstanceID: z.string(),
});

export type TransformFunctionDatabaseRepresentation = z.infer<
  typeof baseZTransformFunctionDatabaseRepresentation
> & {
  arguments: (
    | TransformFunctionDatabaseRepresentation
    | ArgumentsRepresentation
  )[];
};

export const ZTransformFunctionDatabaseRepresentation: z.ZodType<TransformFunctionDatabaseRepresentation> =
  baseZTransformFunctionDatabaseRepresentation.extend({
    arguments: z.lazy(() =>
      z
        .union([
          ZTransformFunctionDatabaseRepresentation,
          ZArgumentsRepresentation,
        ])
        .array()
    ),
  });

// typeguard convenience function
export function isTransformFunctionDatabaseRepresentation(
  x: any
): x is TransformFunctionDatabaseRepresentation {
  const { success } = ZTransformFunctionDatabaseRepresentation.safeParse(x);
  return success;
}

export function isTransformFunctionGQLRepresentation(
  x: any
): x is TransformFunctionGQLRepresentation {
  const { success } = ZTransformFunctionGQLRepresentation.safeParse(x);
  return success;
}
