import { type CheckCidOptions, type Cid, type InferCheckedCid } from '@atproto/lex-data';
import { Schema, type ValidationContext } from '../core.js';
export type { Cid };
/**
 * Configuration options for CID schema validation.
 *
 * @see CheckCidOptions from @atproto/lex-data for available options
 */
export type CidSchemaOptions = CheckCidOptions;
/**
 * Schema for validating Content Identifiers (CIDs).
 *
 * CIDs are self-describing content-addressed identifiers used in AT Protocol
 * to reference data by its cryptographic hash. This schema validates that
 * the input is a valid CID object.
 *
 * @template TOptions - The configuration options type
 *
 * @example
 * ```ts
 * const schema = new CidSchema()
 * const result = schema.validate(someCid)
 * ```
 */
export declare class CidSchema<const TOptions extends CidSchemaOptions = {
    flavor: undefined;
}> extends Schema<InferCheckedCid<TOptions>> {
    readonly options?: TOptions | undefined;
    readonly type: 'cid';
    constructor(options?: TOptions | undefined);
    validateInContext(input: unknown, ctx: ValidationContext): import("../core.js").LexValidationError | import("../core.js").ValidationSuccess<Cid<0 | 1, number, number>>;
}
/**
 * Creates a CID schema for validating Content Identifiers.
 *
 * CIDs are used throughout AT Protocol to reference content by its hash.
 * This is commonly used for referencing blobs, commits, and other data.
 *
 * @param options - Optional configuration for CID validation
 * @returns A new {@link CidSchema} instance
 *
 * @example
 * ```ts
 * // Basic CID validation
 * const cidSchema = l.cid()
 *
 * // Validate a CID from a blob reference
 * const result = cidSchema.validate(blobRef.ref)
 * ```
 */
export declare const cid: <O extends CidSchemaOptions = {}>(options?: O) => CidSchema<O>;
//# sourceMappingURL=cid.d.ts.map