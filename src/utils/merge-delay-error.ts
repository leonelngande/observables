import {BehaviorSubject, concat, merge, Observable, of} from 'rxjs';
import {catchError, filter, finalize, first, map, mergeAll} from 'rxjs/operators';

/* tslint:disable:max-line-length */
export function mergeDelayError<O1>(o1: Observable<O1>): Observable<O1>;
export function mergeDelayError<O1, O2>(o1: Observable<O1>, o2: Observable<O2>): Observable<O1 | O2>;
export function mergeDelayError<O1, O2, O3>(o1: Observable<O1>, o2: Observable<O2>, o3: Observable<O3>): Observable<O1 | O2 | O3>;
export function mergeDelayError<O1, O2, O3, O4>(o1: Observable<O1>, o2: Observable<O2>, o3: Observable<O3>, o4: Observable<O4>): Observable<O1 | O2 | O3 | O4>;
export function mergeDelayError<O1, O2, O3, O4, O5>(o1: Observable<O1>, o2: Observable<O2>, o3: Observable<O3>, o4: Observable<O4>, o5: Observable<O5>): Observable<O1 | O2 | O3 | O4 | O5>;
export function mergeDelayError<O1, O2, O3, O4, O5, O6>(o1: Observable<O1>, o2: Observable<O2>, o3: Observable<O3>, o4: Observable<O4>, o5: Observable<O5>, o6: Observable<O6>): Observable<O1 | O2 | O3 | O4 | O5 | O6>;
export function mergeDelayError<T>(...observables: Observable<T>[]): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * Creates an output observable which concurrently emits all values from every
 * given input observable, but delays any thrown errors until all observables have
 * completed, and throws the first error.
 */
export function mergeDelayError<T>(...observables: Observable<T>[]): Observable<T> {
    const EMPTY_ERROR = Object.freeze({});

    return of(observables).pipe(
        map(obs => {
            const replayError$ = new BehaviorSubject(EMPTY_ERROR);

            const mergeDelayError$ = obs.map(o => o.pipe(
                catchError((err) => {
                    if (replayError$.getValue() === EMPTY_ERROR) {
                        replayError$.next(err);
                    }
                    return of();
                })
            ));

            const error$ = replayError$.pipe(
                first(),
                filter(value => value !== EMPTY_ERROR),
                map(value => {
                    throw value;
                })
            );

            return concat(merge<T>(...mergeDelayError$), error$).pipe(
                finalize(() => replayError$.complete())
            );
        }),
        mergeAll()
    );
}
