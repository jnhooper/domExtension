// Run the task `maxAttempts` times at an interval of `interval` ms. If it succeeds (as indicated by
// the 'success' property the task returns) within the given  number of attempts, returns a promise
// that resolves to its result. Otherwise rejects.
export function retry<T>(task: () => { success: boolean, result: T }, maxAttempts: number, interval: number): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const timerHandle = setInterval(() => {
      const taskReturnVal = task();
      if (taskReturnVal.success) {
        clearInterval(timerHandle);
        resolve(taskReturnVal.result);
      } else if (attempts >= maxAttempts) {
        clearInterval(timerHandle);
        reject();
      } else {
        attempts++;
      }
    }, interval);
  });
};
