import { $typed, Schema, } from '../core.js';
import { lazyProperty } from '../util/lazy-property.js';
import { literal } from './literal.js';
import { string } from './string.js';
import { withDefault } from './with-default.js';
/**
 * Schema for AT Protocol records with a type identifier and key constraints.
 *
 * Records are the primary data unit in AT Protocol. Each record has a `$type`
 * field identifying its Lexicon schema, and is stored at a specific key
 * (TID, NSID, or other format) in a repository.
 *
 * @template TKey - The record key type ('tid', 'nsid', 'any', or 'literal:...')
 * @template TType - The NSID string identifying this record type
 * @template TShape - The validator type for the record's data shape
 *
 * @example
 * ```ts
 * const postSchema = new RecordSchema(
 *   'tid',
 *   'app.bsky.feed.post',
 *   l.object({ text: l.string(), createdAt: l.string() })
 * )
 * ```
 */
export class RecordSchema extends Schema {
    constructor(key, $type, schema) {
        super();
        this.key = key;
        this.$type = $type;
        this.schema = schema;
        this.type = 'record';
        this.keySchema = recordKey(key);
    }
    validateInContext(input, ctx) {
        const result = ctx.validate(input, this.schema);
        if (!result.success) {
            return result;
        }
        if (result.value.$type !== this.$type) {
            return ctx.issueInvalidPropertyValue(result.value, '$type', [this.$type]);
        }
        return result;
    }
    build(input) {
        return $typed(input, this.$type);
    }
    isTypeOf(value) {
        return value.$type === this.$type;
    }
    /**
     * Bound alias for {@link build} for compatibility with generated utilities.
     * @see {@link build}
     */
    get $build() {
        return lazyProperty(this, '$build', this.build.bind(this));
    }
    /**
     * Bound alias for {@link isTypeOf} for compatibility with generated utilities.
     * @see {@link isTypeOf}
     */
    get $isTypeOf() {
        return lazyProperty(this, '$isTypeOf', this.isTypeOf.bind(this));
    }
}
const keySchema = string({ format: 'record-key' });
const tidSchema = string({ format: 'tid' });
const nsidSchema = string({ format: 'nsid' });
const selfLiteralSchema = withDefault(literal('self'), 'self');
function recordKey(key) {
    // @NOTE Use cached instances for common schemas
    if (key === 'any')
        return keySchema;
    if (key === 'tid')
        return tidSchema;
    if (key === 'nsid')
        return nsidSchema;
    if (key.startsWith('literal:')) {
        const value = key.slice(8);
        if (value === 'self')
            return selfLiteralSchema;
        return withDefault(literal(value), value);
    }
    throw new Error(`Unsupported record key type: ${key}`);
}
/*@__NO_SIDE_EFFECTS__*/
export function record(key, type, validator) {
    return new RecordSchema(key, type, validator);
}
//# sourceMappingURL=record.js.map