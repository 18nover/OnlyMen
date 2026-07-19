/**
 * Builds a filter function from include/exclude patterns.
 *
 * The returned filter returns `true` for NSIDs that match any include pattern
 * (or all NSIDs if no include patterns are specified) AND do not match any
 * exclude pattern.
 *
 * @param options - The filter options containing include/exclude patterns
 * @returns A filter function that can be applied to lexicon NSIDs
 *
 * @example
 * ```ts
 * const filter = buildFilter({
 *   include: 'app.bsky.*',
 *   exclude: '*.internal.*',
 * })
 *
 * filter('app.bsky.feed.post')     // true
 * filter('app.bsky.internal.foo')  // false
 * filter('com.atproto.repo')       // false (not included)
 * ```
 */
export function buildFilter(options) {
    const include = createMatcher(options.include, () => true);
    const exclude = createMatcher(options.exclude, () => false);
    return (id) => include(id) && !exclude(id);
}
function createMatcher(pattern, fallback) {
    if (!pattern?.length) {
        return fallback;
    }
    else if (Array.isArray(pattern)) {
        return pattern.map(buildMatcher).reduce(combineFilters);
    }
    else {
        return buildMatcher(pattern);
    }
}
function combineFilters(a, b) {
    return (input) => a(input) || b(input);
}
function buildMatcher(pattern) {
    if (pattern.includes('*')) {
        const regex = new RegExp(`^${pattern.replaceAll('.', '\\.').replaceAll('*', '.+')}$`);
        return (input) => regex.test(input);
    }
    return (input) => pattern === input;
}
//# sourceMappingURL=filter.js.map