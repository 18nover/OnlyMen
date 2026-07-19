import type { LexiconDocument, LexiconIndexer } from '@atproto/lex-document';
import type { Filter } from './filter.js';
/**
 * A lexicon indexer that filters documents based on a provided filter.
 *
 * If a document was filtered out but later requested via `get()`, the filter
 * will be bypassed for that document.
 */
export declare class FilteredIndexer implements LexiconIndexer, AsyncDisposable {
    readonly indexer: LexiconIndexer & AsyncIterable<LexiconDocument>;
    readonly filter: Filter;
    protected readonly returned: Set<string>;
    constructor(indexer: LexiconIndexer & AsyncIterable<LexiconDocument>, filter: Filter);
    get(id: string): Promise<LexiconDocument>;
    [Symbol.asyncIterator](): AsyncGenerator<{
        lexicon: 1;
        id: `${string}.${string}.${string}`;
        revision?: number | undefined;
        description?: string | undefined;
        defs: {
            [x: string]: {
                type: "permission-set";
                permissions: {
                    [x: string]: string | number | boolean | string[] | number[] | boolean[];
                    type: "permission";
                    resource: string;
                }[];
                title?: string | undefined;
                'title:lang'?: Record<string, string> | undefined;
                detail?: string | undefined;
                'detail:lang'?: Record<string, string> | undefined;
                description?: string | undefined;
            } | {
                type: "procedure";
                parameters?: {
                    type: "params";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    description?: string | undefined;
                } | undefined;
                input?: {
                    encoding: string;
                    schema?: {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "object";
                        properties: Record<string, {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "array";
                            items: {
                                type: "boolean";
                                default?: boolean | undefined;
                                const?: boolean | undefined;
                                description?: string | undefined;
                            } | {
                                type: "integer";
                                default?: number | undefined;
                                minimum?: number | undefined;
                                maximum?: number | undefined;
                                enum?: number[] | undefined;
                                const?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "string";
                                format?: import("@atproto/lex-schema").StringFormat | undefined;
                                default?: string | undefined;
                                minLength?: number | undefined;
                                maxLength?: number | undefined;
                                minGraphemes?: number | undefined;
                                maxGraphemes?: number | undefined;
                                enum?: string[] | undefined;
                                const?: string | undefined;
                                knownValues?: string[] | undefined;
                                description?: string | undefined;
                            } | {
                                type: "bytes";
                                maxLength?: number | undefined;
                                minLength?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "cid-link";
                                description?: string | undefined;
                            } | {
                                type: "blob";
                                accept?: string[] | undefined;
                                maxSize?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "unknown";
                                description?: string | undefined;
                            } | {
                                type: "ref";
                                ref: string;
                                description?: string | undefined;
                            } | {
                                type: "union";
                                refs: string[];
                                closed?: boolean | undefined;
                                description?: string | undefined;
                            };
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            description?: string | undefined;
                        }>;
                        required?: string[] | undefined;
                        nullable?: string[] | undefined;
                        description?: string | undefined;
                    } | undefined;
                    description?: string | undefined;
                } | undefined;
                output?: {
                    encoding: string;
                    schema?: {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "object";
                        properties: Record<string, {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "array";
                            items: {
                                type: "boolean";
                                default?: boolean | undefined;
                                const?: boolean | undefined;
                                description?: string | undefined;
                            } | {
                                type: "integer";
                                default?: number | undefined;
                                minimum?: number | undefined;
                                maximum?: number | undefined;
                                enum?: number[] | undefined;
                                const?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "string";
                                format?: import("@atproto/lex-schema").StringFormat | undefined;
                                default?: string | undefined;
                                minLength?: number | undefined;
                                maxLength?: number | undefined;
                                minGraphemes?: number | undefined;
                                maxGraphemes?: number | undefined;
                                enum?: string[] | undefined;
                                const?: string | undefined;
                                knownValues?: string[] | undefined;
                                description?: string | undefined;
                            } | {
                                type: "bytes";
                                maxLength?: number | undefined;
                                minLength?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "cid-link";
                                description?: string | undefined;
                            } | {
                                type: "blob";
                                accept?: string[] | undefined;
                                maxSize?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "unknown";
                                description?: string | undefined;
                            } | {
                                type: "ref";
                                ref: string;
                                description?: string | undefined;
                            } | {
                                type: "union";
                                refs: string[];
                                closed?: boolean | undefined;
                                description?: string | undefined;
                            };
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            description?: string | undefined;
                        }>;
                        required?: string[] | undefined;
                        nullable?: string[] | undefined;
                        description?: string | undefined;
                    } | undefined;
                    description?: string | undefined;
                } | undefined;
                errors?: {
                    name: string;
                    description?: string | undefined;
                }[] | undefined;
                description?: string | undefined;
            } | {
                type: "query";
                parameters?: {
                    type: "params";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    description?: string | undefined;
                } | undefined;
                output?: {
                    encoding: string;
                    schema?: {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "object";
                        properties: Record<string, {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "array";
                            items: {
                                type: "boolean";
                                default?: boolean | undefined;
                                const?: boolean | undefined;
                                description?: string | undefined;
                            } | {
                                type: "integer";
                                default?: number | undefined;
                                minimum?: number | undefined;
                                maximum?: number | undefined;
                                enum?: number[] | undefined;
                                const?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "string";
                                format?: import("@atproto/lex-schema").StringFormat | undefined;
                                default?: string | undefined;
                                minLength?: number | undefined;
                                maxLength?: number | undefined;
                                minGraphemes?: number | undefined;
                                maxGraphemes?: number | undefined;
                                enum?: string[] | undefined;
                                const?: string | undefined;
                                knownValues?: string[] | undefined;
                                description?: string | undefined;
                            } | {
                                type: "bytes";
                                maxLength?: number | undefined;
                                minLength?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "cid-link";
                                description?: string | undefined;
                            } | {
                                type: "blob";
                                accept?: string[] | undefined;
                                maxSize?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "unknown";
                                description?: string | undefined;
                            } | {
                                type: "ref";
                                ref: string;
                                description?: string | undefined;
                            } | {
                                type: "union";
                                refs: string[];
                                closed?: boolean | undefined;
                                description?: string | undefined;
                            };
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            description?: string | undefined;
                        }>;
                        required?: string[] | undefined;
                        nullable?: string[] | undefined;
                        description?: string | undefined;
                    } | undefined;
                    description?: string | undefined;
                } | undefined;
                errors?: {
                    name: string;
                    description?: string | undefined;
                }[] | undefined;
                description?: string | undefined;
            } | {
                type: "record";
                record: {
                    type: "object";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "bytes";
                        maxLength?: number | undefined;
                        minLength?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "cid-link";
                        description?: string | undefined;
                    } | {
                        type: "blob";
                        accept?: string[] | undefined;
                        maxSize?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "unknown";
                        description?: string | undefined;
                    } | {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    nullable?: string[] | undefined;
                    description?: string | undefined;
                };
                description?: string | undefined;
                key: import("@atproto/lex-schema").LexiconRecordKey;
            } | {
                type: "subscription";
                description?: string | undefined;
                parameters?: {
                    type: "params";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    description?: string | undefined;
                } | undefined;
                message: {
                    description?: string | undefined;
                    schema: {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    };
                };
                errors?: {
                    name: string;
                    description?: string | undefined;
                }[] | undefined;
            } | {
                type: "boolean";
                default?: boolean | undefined;
                const?: boolean | undefined;
                description?: string | undefined;
            } | {
                type: "integer";
                default?: number | undefined;
                minimum?: number | undefined;
                maximum?: number | undefined;
                enum?: number[] | undefined;
                const?: number | undefined;
                description?: string | undefined;
            } | {
                type: "string";
                format?: import("@atproto/lex-schema").StringFormat | undefined;
                default?: string | undefined;
                minLength?: number | undefined;
                maxLength?: number | undefined;
                minGraphemes?: number | undefined;
                maxGraphemes?: number | undefined;
                enum?: string[] | undefined;
                const?: string | undefined;
                knownValues?: string[] | undefined;
                description?: string | undefined;
            } | {
                type: "bytes";
                maxLength?: number | undefined;
                minLength?: number | undefined;
                description?: string | undefined;
            } | {
                type: "cid-link";
                description?: string | undefined;
            } | {
                type: "blob";
                accept?: string[] | undefined;
                maxSize?: number | undefined;
                description?: string | undefined;
            } | {
                type: "array";
                items: {
                    type: "boolean";
                    default?: boolean | undefined;
                    const?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "integer";
                    default?: number | undefined;
                    minimum?: number | undefined;
                    maximum?: number | undefined;
                    enum?: number[] | undefined;
                    const?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "string";
                    format?: import("@atproto/lex-schema").StringFormat | undefined;
                    default?: string | undefined;
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    minGraphemes?: number | undefined;
                    maxGraphemes?: number | undefined;
                    enum?: string[] | undefined;
                    const?: string | undefined;
                    knownValues?: string[] | undefined;
                    description?: string | undefined;
                } | {
                    type: "bytes";
                    maxLength?: number | undefined;
                    minLength?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "cid-link";
                    description?: string | undefined;
                } | {
                    type: "blob";
                    accept?: string[] | undefined;
                    maxSize?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "unknown";
                    description?: string | undefined;
                } | {
                    type: "ref";
                    ref: string;
                    description?: string | undefined;
                } | {
                    type: "union";
                    refs: string[];
                    closed?: boolean | undefined;
                    description?: string | undefined;
                };
                minLength?: number | undefined;
                maxLength?: number | undefined;
                description?: string | undefined;
            } | {
                type: "object";
                properties: Record<string, {
                    type: "boolean";
                    default?: boolean | undefined;
                    const?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "integer";
                    default?: number | undefined;
                    minimum?: number | undefined;
                    maximum?: number | undefined;
                    enum?: number[] | undefined;
                    const?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "string";
                    format?: import("@atproto/lex-schema").StringFormat | undefined;
                    default?: string | undefined;
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    minGraphemes?: number | undefined;
                    maxGraphemes?: number | undefined;
                    enum?: string[] | undefined;
                    const?: string | undefined;
                    knownValues?: string[] | undefined;
                    description?: string | undefined;
                } | {
                    type: "bytes";
                    maxLength?: number | undefined;
                    minLength?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "cid-link";
                    description?: string | undefined;
                } | {
                    type: "blob";
                    accept?: string[] | undefined;
                    maxSize?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "unknown";
                    description?: string | undefined;
                } | {
                    type: "ref";
                    ref: string;
                    description?: string | undefined;
                } | {
                    type: "union";
                    refs: string[];
                    closed?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "array";
                    items: {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "bytes";
                        maxLength?: number | undefined;
                        minLength?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "cid-link";
                        description?: string | undefined;
                    } | {
                        type: "blob";
                        accept?: string[] | undefined;
                        maxSize?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "unknown";
                        description?: string | undefined;
                    } | {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    };
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    description?: string | undefined;
                }>;
                required?: string[] | undefined;
                nullable?: string[] | undefined;
                description?: string | undefined;
            } | {
                type: "token";
                description?: string | undefined;
            } | {
                type: "boolean";
                default?: boolean | undefined;
                const?: boolean | undefined;
                description?: string | undefined;
            } | {
                type: "integer";
                default?: number | undefined;
                minimum?: number | undefined;
                maximum?: number | undefined;
                enum?: number[] | undefined;
                const?: number | undefined;
                description?: string | undefined;
            } | {
                type: "string";
                format?: import("@atproto/lex-schema").StringFormat | undefined;
                default?: string | undefined;
                minLength?: number | undefined;
                maxLength?: number | undefined;
                minGraphemes?: number | undefined;
                maxGraphemes?: number | undefined;
                enum?: string[] | undefined;
                const?: string | undefined;
                knownValues?: string[] | undefined;
                description?: string | undefined;
            } | {
                type: "bytes";
                maxLength?: number | undefined;
                minLength?: number | undefined;
                description?: string | undefined;
            } | {
                type: "cid-link";
                description?: string | undefined;
            } | {
                type: "blob";
                accept?: string[] | undefined;
                maxSize?: number | undefined;
                description?: string | undefined;
            } | {
                type: "array";
                items: {
                    type: "boolean";
                    default?: boolean | undefined;
                    const?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "integer";
                    default?: number | undefined;
                    minimum?: number | undefined;
                    maximum?: number | undefined;
                    enum?: number[] | undefined;
                    const?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "string";
                    format?: import("@atproto/lex-schema").StringFormat | undefined;
                    default?: string | undefined;
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    minGraphemes?: number | undefined;
                    maxGraphemes?: number | undefined;
                    enum?: string[] | undefined;
                    const?: string | undefined;
                    knownValues?: string[] | undefined;
                    description?: string | undefined;
                } | {
                    type: "bytes";
                    maxLength?: number | undefined;
                    minLength?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "cid-link";
                    description?: string | undefined;
                } | {
                    type: "blob";
                    accept?: string[] | undefined;
                    maxSize?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "unknown";
                    description?: string | undefined;
                } | {
                    type: "ref";
                    ref: string;
                    description?: string | undefined;
                } | {
                    type: "union";
                    refs: string[];
                    closed?: boolean | undefined;
                    description?: string | undefined;
                };
                minLength?: number | undefined;
                maxLength?: number | undefined;
                description?: string | undefined;
            } | {
                type: "object";
                properties: Record<string, {
                    type: "boolean";
                    default?: boolean | undefined;
                    const?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "integer";
                    default?: number | undefined;
                    minimum?: number | undefined;
                    maximum?: number | undefined;
                    enum?: number[] | undefined;
                    const?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "string";
                    format?: import("@atproto/lex-schema").StringFormat | undefined;
                    default?: string | undefined;
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    minGraphemes?: number | undefined;
                    maxGraphemes?: number | undefined;
                    enum?: string[] | undefined;
                    const?: string | undefined;
                    knownValues?: string[] | undefined;
                    description?: string | undefined;
                } | {
                    type: "bytes";
                    maxLength?: number | undefined;
                    minLength?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "cid-link";
                    description?: string | undefined;
                } | {
                    type: "blob";
                    accept?: string[] | undefined;
                    maxSize?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "unknown";
                    description?: string | undefined;
                } | {
                    type: "ref";
                    ref: string;
                    description?: string | undefined;
                } | {
                    type: "union";
                    refs: string[];
                    closed?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "array";
                    items: {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "bytes";
                        maxLength?: number | undefined;
                        minLength?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "cid-link";
                        description?: string | undefined;
                    } | {
                        type: "blob";
                        accept?: string[] | undefined;
                        maxSize?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "unknown";
                        description?: string | undefined;
                    } | {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    };
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    description?: string | undefined;
                }>;
                required?: string[] | undefined;
                nullable?: string[] | undefined;
                description?: string | undefined;
            } | {
                type: "token";
                description?: string | undefined;
            } | undefined;
            main?: {
                type: "permission-set";
                permissions: {
                    [x: string]: string | number | boolean | string[] | number[] | boolean[];
                    type: "permission";
                    resource: string;
                }[];
                title?: string | undefined;
                'title:lang'?: Record<string, string> | undefined;
                detail?: string | undefined;
                'detail:lang'?: Record<string, string> | undefined;
                description?: string | undefined;
            } | {
                type: "procedure";
                parameters?: {
                    type: "params";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    description?: string | undefined;
                } | undefined;
                input?: {
                    encoding: string;
                    schema?: {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "object";
                        properties: Record<string, {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "array";
                            items: {
                                type: "boolean";
                                default?: boolean | undefined;
                                const?: boolean | undefined;
                                description?: string | undefined;
                            } | {
                                type: "integer";
                                default?: number | undefined;
                                minimum?: number | undefined;
                                maximum?: number | undefined;
                                enum?: number[] | undefined;
                                const?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "string";
                                format?: import("@atproto/lex-schema").StringFormat | undefined;
                                default?: string | undefined;
                                minLength?: number | undefined;
                                maxLength?: number | undefined;
                                minGraphemes?: number | undefined;
                                maxGraphemes?: number | undefined;
                                enum?: string[] | undefined;
                                const?: string | undefined;
                                knownValues?: string[] | undefined;
                                description?: string | undefined;
                            } | {
                                type: "bytes";
                                maxLength?: number | undefined;
                                minLength?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "cid-link";
                                description?: string | undefined;
                            } | {
                                type: "blob";
                                accept?: string[] | undefined;
                                maxSize?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "unknown";
                                description?: string | undefined;
                            } | {
                                type: "ref";
                                ref: string;
                                description?: string | undefined;
                            } | {
                                type: "union";
                                refs: string[];
                                closed?: boolean | undefined;
                                description?: string | undefined;
                            };
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            description?: string | undefined;
                        }>;
                        required?: string[] | undefined;
                        nullable?: string[] | undefined;
                        description?: string | undefined;
                    } | undefined;
                    description?: string | undefined;
                } | undefined;
                output?: {
                    encoding: string;
                    schema?: {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "object";
                        properties: Record<string, {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "array";
                            items: {
                                type: "boolean";
                                default?: boolean | undefined;
                                const?: boolean | undefined;
                                description?: string | undefined;
                            } | {
                                type: "integer";
                                default?: number | undefined;
                                minimum?: number | undefined;
                                maximum?: number | undefined;
                                enum?: number[] | undefined;
                                const?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "string";
                                format?: import("@atproto/lex-schema").StringFormat | undefined;
                                default?: string | undefined;
                                minLength?: number | undefined;
                                maxLength?: number | undefined;
                                minGraphemes?: number | undefined;
                                maxGraphemes?: number | undefined;
                                enum?: string[] | undefined;
                                const?: string | undefined;
                                knownValues?: string[] | undefined;
                                description?: string | undefined;
                            } | {
                                type: "bytes";
                                maxLength?: number | undefined;
                                minLength?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "cid-link";
                                description?: string | undefined;
                            } | {
                                type: "blob";
                                accept?: string[] | undefined;
                                maxSize?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "unknown";
                                description?: string | undefined;
                            } | {
                                type: "ref";
                                ref: string;
                                description?: string | undefined;
                            } | {
                                type: "union";
                                refs: string[];
                                closed?: boolean | undefined;
                                description?: string | undefined;
                            };
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            description?: string | undefined;
                        }>;
                        required?: string[] | undefined;
                        nullable?: string[] | undefined;
                        description?: string | undefined;
                    } | undefined;
                    description?: string | undefined;
                } | undefined;
                errors?: {
                    name: string;
                    description?: string | undefined;
                }[] | undefined;
                description?: string | undefined;
            } | {
                type: "query";
                parameters?: {
                    type: "params";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    description?: string | undefined;
                } | undefined;
                output?: {
                    encoding: string;
                    schema?: {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "object";
                        properties: Record<string, {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "array";
                            items: {
                                type: "boolean";
                                default?: boolean | undefined;
                                const?: boolean | undefined;
                                description?: string | undefined;
                            } | {
                                type: "integer";
                                default?: number | undefined;
                                minimum?: number | undefined;
                                maximum?: number | undefined;
                                enum?: number[] | undefined;
                                const?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "string";
                                format?: import("@atproto/lex-schema").StringFormat | undefined;
                                default?: string | undefined;
                                minLength?: number | undefined;
                                maxLength?: number | undefined;
                                minGraphemes?: number | undefined;
                                maxGraphemes?: number | undefined;
                                enum?: string[] | undefined;
                                const?: string | undefined;
                                knownValues?: string[] | undefined;
                                description?: string | undefined;
                            } | {
                                type: "bytes";
                                maxLength?: number | undefined;
                                minLength?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "cid-link";
                                description?: string | undefined;
                            } | {
                                type: "blob";
                                accept?: string[] | undefined;
                                maxSize?: number | undefined;
                                description?: string | undefined;
                            } | {
                                type: "unknown";
                                description?: string | undefined;
                            } | {
                                type: "ref";
                                ref: string;
                                description?: string | undefined;
                            } | {
                                type: "union";
                                refs: string[];
                                closed?: boolean | undefined;
                                description?: string | undefined;
                            };
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            description?: string | undefined;
                        }>;
                        required?: string[] | undefined;
                        nullable?: string[] | undefined;
                        description?: string | undefined;
                    } | undefined;
                    description?: string | undefined;
                } | undefined;
                errors?: {
                    name: string;
                    description?: string | undefined;
                }[] | undefined;
                description?: string | undefined;
            } | {
                type: "record";
                record: {
                    type: "object";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "bytes";
                        maxLength?: number | undefined;
                        minLength?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "cid-link";
                        description?: string | undefined;
                    } | {
                        type: "blob";
                        accept?: string[] | undefined;
                        maxSize?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "unknown";
                        description?: string | undefined;
                    } | {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        } | {
                            type: "bytes";
                            maxLength?: number | undefined;
                            minLength?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "cid-link";
                            description?: string | undefined;
                        } | {
                            type: "blob";
                            accept?: string[] | undefined;
                            maxSize?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "unknown";
                            description?: string | undefined;
                        } | {
                            type: "ref";
                            ref: string;
                            description?: string | undefined;
                        } | {
                            type: "union";
                            refs: string[];
                            closed?: boolean | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    nullable?: string[] | undefined;
                    description?: string | undefined;
                };
                description?: string | undefined;
                key: import("@atproto/lex-schema").LexiconRecordKey;
            } | {
                type: "subscription";
                description?: string | undefined;
                parameters?: {
                    type: "params";
                    properties: Record<string, {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "array";
                        items: {
                            type: "boolean";
                            default?: boolean | undefined;
                            const?: boolean | undefined;
                            description?: string | undefined;
                        } | {
                            type: "integer";
                            default?: number | undefined;
                            minimum?: number | undefined;
                            maximum?: number | undefined;
                            enum?: number[] | undefined;
                            const?: number | undefined;
                            description?: string | undefined;
                        } | {
                            type: "string";
                            format?: import("@atproto/lex-schema").StringFormat | undefined;
                            default?: string | undefined;
                            minLength?: number | undefined;
                            maxLength?: number | undefined;
                            minGraphemes?: number | undefined;
                            maxGraphemes?: number | undefined;
                            enum?: string[] | undefined;
                            const?: string | undefined;
                            knownValues?: string[] | undefined;
                            description?: string | undefined;
                        };
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        description?: string | undefined;
                    }>;
                    required?: string[] | undefined;
                    description?: string | undefined;
                } | undefined;
                message: {
                    description?: string | undefined;
                    schema: {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    };
                };
                errors?: {
                    name: string;
                    description?: string | undefined;
                }[] | undefined;
            } | {
                type: "boolean";
                default?: boolean | undefined;
                const?: boolean | undefined;
                description?: string | undefined;
            } | {
                type: "integer";
                default?: number | undefined;
                minimum?: number | undefined;
                maximum?: number | undefined;
                enum?: number[] | undefined;
                const?: number | undefined;
                description?: string | undefined;
            } | {
                type: "string";
                format?: import("@atproto/lex-schema").StringFormat | undefined;
                default?: string | undefined;
                minLength?: number | undefined;
                maxLength?: number | undefined;
                minGraphemes?: number | undefined;
                maxGraphemes?: number | undefined;
                enum?: string[] | undefined;
                const?: string | undefined;
                knownValues?: string[] | undefined;
                description?: string | undefined;
            } | {
                type: "bytes";
                maxLength?: number | undefined;
                minLength?: number | undefined;
                description?: string | undefined;
            } | {
                type: "cid-link";
                description?: string | undefined;
            } | {
                type: "blob";
                accept?: string[] | undefined;
                maxSize?: number | undefined;
                description?: string | undefined;
            } | {
                type: "array";
                items: {
                    type: "boolean";
                    default?: boolean | undefined;
                    const?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "integer";
                    default?: number | undefined;
                    minimum?: number | undefined;
                    maximum?: number | undefined;
                    enum?: number[] | undefined;
                    const?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "string";
                    format?: import("@atproto/lex-schema").StringFormat | undefined;
                    default?: string | undefined;
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    minGraphemes?: number | undefined;
                    maxGraphemes?: number | undefined;
                    enum?: string[] | undefined;
                    const?: string | undefined;
                    knownValues?: string[] | undefined;
                    description?: string | undefined;
                } | {
                    type: "bytes";
                    maxLength?: number | undefined;
                    minLength?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "cid-link";
                    description?: string | undefined;
                } | {
                    type: "blob";
                    accept?: string[] | undefined;
                    maxSize?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "unknown";
                    description?: string | undefined;
                } | {
                    type: "ref";
                    ref: string;
                    description?: string | undefined;
                } | {
                    type: "union";
                    refs: string[];
                    closed?: boolean | undefined;
                    description?: string | undefined;
                };
                minLength?: number | undefined;
                maxLength?: number | undefined;
                description?: string | undefined;
            } | {
                type: "object";
                properties: Record<string, {
                    type: "boolean";
                    default?: boolean | undefined;
                    const?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "integer";
                    default?: number | undefined;
                    minimum?: number | undefined;
                    maximum?: number | undefined;
                    enum?: number[] | undefined;
                    const?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "string";
                    format?: import("@atproto/lex-schema").StringFormat | undefined;
                    default?: string | undefined;
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    minGraphemes?: number | undefined;
                    maxGraphemes?: number | undefined;
                    enum?: string[] | undefined;
                    const?: string | undefined;
                    knownValues?: string[] | undefined;
                    description?: string | undefined;
                } | {
                    type: "bytes";
                    maxLength?: number | undefined;
                    minLength?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "cid-link";
                    description?: string | undefined;
                } | {
                    type: "blob";
                    accept?: string[] | undefined;
                    maxSize?: number | undefined;
                    description?: string | undefined;
                } | {
                    type: "unknown";
                    description?: string | undefined;
                } | {
                    type: "ref";
                    ref: string;
                    description?: string | undefined;
                } | {
                    type: "union";
                    refs: string[];
                    closed?: boolean | undefined;
                    description?: string | undefined;
                } | {
                    type: "array";
                    items: {
                        type: "boolean";
                        default?: boolean | undefined;
                        const?: boolean | undefined;
                        description?: string | undefined;
                    } | {
                        type: "integer";
                        default?: number | undefined;
                        minimum?: number | undefined;
                        maximum?: number | undefined;
                        enum?: number[] | undefined;
                        const?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "string";
                        format?: import("@atproto/lex-schema").StringFormat | undefined;
                        default?: string | undefined;
                        minLength?: number | undefined;
                        maxLength?: number | undefined;
                        minGraphemes?: number | undefined;
                        maxGraphemes?: number | undefined;
                        enum?: string[] | undefined;
                        const?: string | undefined;
                        knownValues?: string[] | undefined;
                        description?: string | undefined;
                    } | {
                        type: "bytes";
                        maxLength?: number | undefined;
                        minLength?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "cid-link";
                        description?: string | undefined;
                    } | {
                        type: "blob";
                        accept?: string[] | undefined;
                        maxSize?: number | undefined;
                        description?: string | undefined;
                    } | {
                        type: "unknown";
                        description?: string | undefined;
                    } | {
                        type: "ref";
                        ref: string;
                        description?: string | undefined;
                    } | {
                        type: "union";
                        refs: string[];
                        closed?: boolean | undefined;
                        description?: string | undefined;
                    };
                    minLength?: number | undefined;
                    maxLength?: number | undefined;
                    description?: string | undefined;
                }>;
                required?: string[] | undefined;
                nullable?: string[] | undefined;
                description?: string | undefined;
            } | {
                type: "token";
                description?: string | undefined;
            } | undefined;
        };
    }, void, unknown>;
    [Symbol.asyncDispose](): Promise<void>;
}
//# sourceMappingURL=filtered-indexer.d.ts.map