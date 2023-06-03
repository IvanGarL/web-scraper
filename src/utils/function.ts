/**
 * Return the resolve value or reject from the given Promise
 * If the function doesn't finish before the timeout then is rejected
 * @param fn Promise to be resolved
 * @param timeout time in ms to wait for the promise to finish, Defaults to 1000ms.
 */
export const PromiseTimeout = async <T>(fn: Promise<T>, timeout = 1000): Promise<T> => {
    const timeoutFn = new Promise<T>((_resolve, reject) => {
        setTimeout(() => reject(new Error(`Timed out at ${timeout} ms.`)), timeout);
    });
    return Promise.race([fn, timeoutFn]);
};
