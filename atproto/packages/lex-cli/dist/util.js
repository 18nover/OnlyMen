import fs from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { ZodError } from 'zod';
import { parseLexiconDoc } from '@atproto/lexicon';
export function readAllLexicons(paths) {
    paths = [...paths].sort(); // incoming path order may have come from locale-dependent shell globs
    const docs = [];
    for (const path of paths) {
        if (!path.endsWith('.json') || !fs.statSync(path).isFile()) {
            continue;
        }
        try {
            docs.push(readLexicon(path));
        }
        catch {
            // skip
        }
    }
    return docs;
}
export function readLexicon(path) {
    let str;
    let obj;
    try {
        str = fs.readFileSync(path, 'utf8');
    }
    catch (e) {
        console.error(`Failed to read file`, path);
        throw e;
    }
    try {
        obj = JSON.parse(str);
    }
    catch (e) {
        console.error(`Failed to parse JSON in file`, path);
        throw e;
    }
    if (obj &&
        typeof obj === 'object' &&
        typeof obj.lexicon === 'number') {
        try {
            return parseLexiconDoc(obj);
        }
        catch (e) {
            console.error(`Invalid lexicon`, path);
            if (e instanceof ZodError) {
                printZodError(e.format());
            }
            throw e;
        }
    }
    else {
        console.error(`Not lexicon schema`, path);
        throw new Error(`Not lexicon schema`);
    }
}
export function genTsObj(lexicons) {
    return `export const lexicons = ${JSON.stringify(lexicons, null, 2)}`;
}
export function genFileDiff(outDir, api) {
    const diffs = [];
    const existingFiles = readdirRecursiveSync(outDir);
    for (const file of api.files) {
        file.path = join(outDir, file.path);
        if (existingFiles.includes(file.path)) {
            diffs.push({ act: 'mod', path: file.path, content: file.content });
        }
        else {
            diffs.push({ act: 'add', path: file.path, content: file.content });
        }
    }
    for (const filepath of existingFiles) {
        if (api.files.find((f) => f.path === filepath)) {
            // do nothing
        }
        else {
            diffs.push({ act: 'del', path: filepath });
        }
    }
    return diffs;
}
export function printFileDiff(diff) {
    for (const d of diff) {
        switch (d.act) {
            case 'add':
                console.log(`${chalk.greenBright('[+ add]')} ${d.path}`);
                break;
            case 'mod':
                console.log(`${chalk.yellowBright('[* mod]')} ${d.path}`);
                break;
            case 'del':
                console.log(`${chalk.redBright('[- del]')} ${d.path}`);
                break;
        }
    }
}
export function applyFileDiff(diff) {
    for (const d of diff) {
        switch (d.act) {
            case 'add':
            case 'mod':
                fs.mkdirSync(join(d.path, '..'), { recursive: true }); // lazy way to make sure the parent dir exists
                fs.writeFileSync(d.path, d.content || '', 'utf8');
                break;
            case 'del':
                fs.unlinkSync(d.path);
                break;
        }
    }
}
function printZodError(node, path = '') {
    if (node._errors?.length) {
        console.log(chalk.red(`Issues at ${path}:`));
        for (const err of dedup(node._errors)) {
            console.log(chalk.red(` - ${err}`));
        }
        return true;
    }
    else {
        for (const k in node) {
            if (k === '_errors') {
                continue;
            }
            printZodError(node[k], `${path}/${k}`);
        }
    }
    return false;
}
function readdirRecursiveSync(root, files = [], prefix = '') {
    const dir = join(root, prefix);
    if (!fs.existsSync(dir))
        return files;
    if (fs.statSync(dir).isDirectory())
        fs.readdirSync(dir).forEach(function (name) {
            readdirRecursiveSync(root, files, join(prefix, name));
        });
    else if (prefix.endsWith('.ts')) {
        files.push(join(root, prefix));
    }
    return files;
}
function dedup(arr) {
    return Array.from(new Set(arr));
}
//# sourceMappingURL=util.js.map