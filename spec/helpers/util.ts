function haveSameElements(a: any, b: any): boolean {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return false;
    }
    for (const i in a) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

function haveSameProps(a: any, b: any): boolean {
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }
    for (const p of Object.keys(a)) {
        if (!Object.prototype.hasOwnProperty.call(b, p) || !Object.is(a[p], b[p])) {
            return false;
        }
    }
    return true;
}

// tslint:disable-next-line:no-namespace
declare namespace jasmine {
    interface ArrayLikeMatchers<T> extends Matchers<ArrayLike<T>> {
        toHaveSameElements(expected: Expected<ArrayLike<T>> | ArrayContaining<T>, expectationFailOutput?: any): boolean;
    }

    interface Matchers<T> {
        toHaveSameProps(expected: Expected<T>, expectationFailOutput?: any): boolean;
    }
}

beforeEach(() => {
    jasmine.addMatchers({
        toHaveSameElements: (util, customEqualityTesters) => {
            return {
                compare: (actual: any, expected: any) => {
                    return {
                        pass: haveSameElements(actual, expected),
                    };
                },
            };
        },
        toHaveSameProps: (util, customEqualityTesters) => {
            return {
                compare: (actual: any, expected: any) => {
                    return {
                        pass: haveSameProps(actual, expected),
                    };
                },
            };
        },
    });
});
