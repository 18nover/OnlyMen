import { type BlobRef, type LegacyBlobRef, type TypedBlobRef, isBlobRef, isLegacyBlobRef, isTypedBlobRef } from '@atproto/lex-data';
import { Schema, type ValidationContext } from '../core.js';
/**
 * Configuration options for blob schema validation.
 */
export type BlobSchemaOptions = {
    /**
     * List of accepted MIME types (supports wildcards like 'image/*' or '*\/*')
     *
     * @default undefined // accepts all MIME types
     */
    accept?: string[];
    /**
     * Maximum blob size in bytes
     *
     * @default undefined // no size limit
     */
    maxSize?: number;
};
export type { BlobRef, LegacyBlobRef, TypedBlobRef };
export { isBlobRef, isLegacyBlobRef, isTypedBlobRef };
/**
 * Schema for validating blob references in AT Protocol.
 *
 * Validates BlobRef objects which contain a CID reference to binary data,
 * along with metadata like MIME type and size. Can optionally accept
 * legacy blob reference format.
 *
 * @template TOptions - The configuration options type
 *
 * @example
 * ```ts
 * const schema = new BlobSchema({ accept: ['image/*'], maxSize: 1000000 })
 * const result = schema.validate(blobRef)
 * ```
 */
export declare class BlobSchema<const TOptions extends BlobSchemaOptions = NonNullable<unknown>> extends Schema<BlobRef> {
    readonly options?: TOptions | undefined;
    readonly type: 'blob';
    constructor(options?: TOptions | undefined);
    validateInContext(input: unknown, ctx: ValidationContext): import("../core.js").LexValidationError | import("../core.js").ValidationSuccess<BlobRef>;
    matchesMime(mime: string): boolean;
}
/**
 * Creates a blob schema for validating blob references with optional constraints.
 *
 * Blob references are used in AT Protocol to reference binary data stored
 * separately from records. They contain a CID, MIME type, and size information.
 *
 * @param options - Optional configuration for MIME type filtering and size limits
 * @returns A new {@link BlobSchema} instance
 *
 * @example
 * ```ts
 * // Basic blob reference
 * const fileSchema = l.blob()
 *
 * // Image files only
 * const imageSchema = l.blob({ accept: ['image/png', 'image/jpeg', 'image/gif'] })
 *
 * // Any image type with size limit
 * const avatarSchema = l.blob({ accept: ['image/*'], maxSize: 1000000 })
 * ```
 */
export declare const blob: <O extends BlobSchemaOptions = {}>(options?: O) => BlobSchema<O>;
//# sourceMappingURL=blob.d.ts.map