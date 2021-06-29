import { HTTPError } from './HTTPError.model';

export default (function HTTPErrorInit() {
  function HTTPErrorInit__create(...args: (string | number)[]): HTTPError {
    let errorMessage: string | undefined;
    let errorStatus: number | undefined;
    args.forEach((arg) => {
      if (typeof arg === 'string') {
        errorMessage = arg;
      } else if (typeof arg === 'number') {
        errorStatus = arg;
      }
    });

    const res: HTTPError = new Error(errorMessage);
    res.status = errorStatus;
    res.type = 'httpError';
    return res;
  }
  function HTTPErrorInit__isHTTPError(err: unknown) {
    const errAsHTTPErr = err as HTTPError;
    return errAsHTTPErr.type === 'httpError' || !!errAsHTTPErr.status;
  }

  return {
    create: HTTPErrorInit__create,
    isHTTPError: HTTPErrorInit__isHTTPError,
  };
})();
