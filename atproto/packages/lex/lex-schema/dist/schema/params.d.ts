import { type Infer, type InferInput, type InferOutput, LexValidationError, type ParseOptions, Schema, type ValidationContext, type Validator, type WithOptionalProperties } from '../core.js';
import { ArraySchema } from './array.js';
import { BooleanSchema } from './boolean.js';
import { EnumSchema } from './enum.js';
import { IntegerSchema } from './integer.js';
import { LiteralSchema } from './literal.js';
import { OptionalSchema } from './optional.js';
import { StringSchema } from './string.js';
import { WithDefaultSchema } from './with-default.js';
/**
 * Scalar types allowed in URL parameters: boolean, integer, or string.
 */
export type ParamScalar = Infer<typeof paramScalarSchema>;
declare const paramScalarSchema: import("./union.js").UnionSchema<readonly [BooleanSchema, IntegerSchema, StringSchema<{}>]>;
/**
 * A single parameter value: scalar or array of scalars.
 */
export type Param = Infer<typeof paramSchema>;
/**
 * Schema for validating individual parameter values.
 */
export declare const paramSchema: import("./union.js").UnionSchema<readonly [import("./union.js").UnionSchema<readonly [BooleanSchema, IntegerSchema, StringSchema<{}>]>, ArraySchema<BooleanSchema>, ArraySchema<IntegerSchema>, ArraySchema<StringSchema<{}>>]>;
/**
 * Type for a params object with string keys and optional param values.
 */
export type Params = Infer<typeof paramsSchema>;
/**
 * Schema for validating arbitrary params objects.
 */
export declare const paramsSchema: import("./dict.js").DictSchema<StringSchema<{}>, OptionalSchema<import("./union.js").UnionSchema<readonly [import("./union.js").UnionSchema<readonly [BooleanSchema, IntegerSchema, StringSchema<{}>]>, ArraySchema<BooleanSchema>, ArraySchema<IntegerSchema>, ArraySchema<StringSchema<{}>>]>>>;
export type ParamScalarValidator = LiteralSchema<string> | LiteralSchema<number> | LiteralSchema<boolean> | EnumSchema<string> | EnumSchema<number> | StringSchema<any> | BooleanSchema | IntegerSchema;
type AsArrayParamSchema<TSchema extends Validator> = TSchema extends any ? ArraySchema<TSchema> : never;
export type ParamValueValidator = ParamScalarValidator | AsArrayParamSchema<ParamScalarValidator>;
export type ParamValidator = ParamValueValidator | OptionalSchema<ParamValueValidator> | OptionalSchema<WithDefaultSchema<ParamValueValidator>> | WithDefaultSchema<ParamValueValidator>;
/**
 * Type representing the shape of a params schema definition.
 *
 * Maps parameter names to their validators (must be Param or undefined).
 */
export type ParamsShape = {
    [x: string]: ParamValidator;
};
/**
 * Schema for validating URL query parameters in Lexicon endpoints.
 *
 * Params are the query string parameters passed to queries, procedures,
 * and subscriptions. Values must be scalars (boolean, integer, string)
 * or arrays of scalars, as they need to be serializable to URL format.
 *
 * Provides methods for converting to/from URLSearchParams.
 *
 * @template TShape - The params shape type mapping names to validators
 *
 * @example
 * ```ts
 * const schema = new ParamsSchema({
 *   limit: l.optional(l.integer({ minimum: 1, maximum: 100 })),
 *   cursor: l.optional(l.string()),
 * })
 * ```
 */
export declare class ParamsSchema<const TShape extends ParamsShape = ParamsShape> extends Schema<WithOptionalProperties<{
    [K in keyof TShape]: InferInput<TShape[K]>;
}>, WithOptionalProperties<{
    [K in keyof TShape]: InferOutput<TShape[K]>;
}>> {
    readonly shape: TShape;
    readonly type: 'params';
    constructor(shape: TShape);
    get shapeValidators(): Map<string, ParamValidator>;
    validateInContext(input: unknown, ctx: ValidationContext): LexValidationError | import("../core.js").ValidationSuccess<Record<string, unknown>>;
    fromURLSearchParams(input: string | Iterable<[string, string]>, options?: ParseOptions): InferOutput<this>;
    toURLSearchParams(input: InferInput<this>): URLSearchParams;
}
/**
 * Creates a params schema for URL query parameters.
 *
 * Params schemas validate query string parameters for Lexicon endpoints.
 * Values must be boolean, integer, string, or arrays of those types.
 *
 * @param properties - Object mapping parameter names to their validators
 * @returns A new {@link ParamsSchema} instance
 *
 * @example
 * ```ts
 * // Simple pagination params
 * const paginationParams = l.params({
 *   limit: l.optional(l.withDefault(l.integer({ minimum: 1, maximum: 100 }), 50)),
 *   cursor: l.optional(l.string()),
 * })
 *
 * // Required parameter
 * const actorParams = l.params({
 *   actor: l.string({ format: 'at-identifier' }),
 * })
 *
 * // Array parameter (multiple values)
 * const filterParams = l.params({
 *   tags: l.optional(l.array(l.string())),
 * })
 *
 * // Convert from URL
 * const urlParams = new URLSearchParams('limit=25&cursor=abc')
 * const validated = paginationParams.fromURLSearchParams(urlParams)
 *
 * // Convert to URL
 * const searchParams = paginationParams.toURLSearchParams({ limit: 25 })
 * ```
 */
export declare const params: <const TShape extends ParamsShape = {}>(properties?: TShape) => ParamsSchema<TShape>;
export {};
//# sourceMappingURL=params.d.ts.map