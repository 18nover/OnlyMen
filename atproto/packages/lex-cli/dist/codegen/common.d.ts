import { type Project, type SourceFile } from 'ts-morph';
import type { LexiconDoc } from '@atproto/lexicon';
import type { GeneratedFile } from '../types.js';
export declare const utilTs: (project: Project) => Promise<GeneratedFile>;
export declare const lexiconsTs: (project: Project, lexicons: LexiconDoc[]) => Promise<GeneratedFile>;
export declare function gen(project: Project, path: string, gen: (file: SourceFile) => Promise<void>): Promise<GeneratedFile>;
//# sourceMappingURL=common.d.ts.map