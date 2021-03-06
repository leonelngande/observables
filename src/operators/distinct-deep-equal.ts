import {MonoTypeOperatorFunction, Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

/**
 * A deep comparison function copied from fast-deep-equal.
 * @see https://github.com/epoberezkin/fast-deep-equal
 */
export function deepEqual(a: any, b: any): boolean {
    if (a === b) {
        return true;
    }

    if (a && b && typeof a === 'object' && typeof b === 'object') {
        const isArrayA = Array.isArray(a);
        const isArrayB = Array.isArray(b);

        if (isArrayA && isArrayB) {
            const lengthA = a.length;
            if (lengthA !== b.length) {
                return false;
            }
            for (let i = lengthA; i-- !== 0;) {
                if (!deepEqual(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }

        if (isArrayA !== isArrayB) {
            return false;
        }

        const isDateA: boolean = a instanceof Date;
        const isDateB: boolean = b instanceof Date;
        if (isDateA !== isDateB) {
            return false;
        }
        if (isDateA && isDateB) {
            return a.getTime() === b.getTime();
        }

        const isRegexpA: boolean = a instanceof RegExp;
        const isRegexpB: boolean = b instanceof RegExp;
        if (isRegexpA !== isRegexpB) {
            return false;
        }
        if (isRegexpA && isRegexpB) {
            return a.toString() === b.toString();
        }

        const keys = Object.keys(a);
        const length = keys.length;

        if (length !== Object.keys(b).length) {
            return false;
        }

        for (let i = length; i-- !== 0;) {
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
                return false;
            }
        }

        for (let i = length; i-- !== 0;) {
            const key = keys[i];
            if (!deepEqual(a[key], b[key])) {
                return false;
            }
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a !== a && b !== b;
}

/**
 * Only emits when the current value is deeply different than the last. Two values that have different references, but contain the
 * same properties will be compared to be the same. This is the same for arrays, nested objects, dates and regular expressions.
 */
export function distinctDeepEqual<T>(): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>): Observable<T> => {
        return source.pipe(
            distinctUntilChanged((x, y) => deepEqual(x, y))
        );
    };
}
