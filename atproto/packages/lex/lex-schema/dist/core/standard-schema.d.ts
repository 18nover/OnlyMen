import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Validator } from './validator.js';
/**
 * The Standard Schema adapter for {@link Validator} instances.
 */
export declare class StandardSchemaAdapter<TInput, TOutput> implements StandardSchemaV1.Props<TInput, TOutput> {
    private readonly validator;
    readonly version = 1;
    readonly vendor = "@atproto/lex-schema";
    readonly types: StandardSchemaV1.Types<TInput, TOutput>;
    constructor(validator: Validator<TInput, TOutput>);
    validate(value: unknown, options?: StandardSchemaV1.Options): StandardSchemaV1.Result<TOutput>;
}
//# sourceMappingURL=standard-schema.d.ts.map