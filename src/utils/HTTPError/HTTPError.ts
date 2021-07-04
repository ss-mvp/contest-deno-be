import { IHTTPError } from './HTTPError.model';

export default (function HTTPErrorInit() {
  /**
   * @param args can be strings, numbers, or objects. Strings will override the error message
   * that gets sent as a default HTTP response ({ message: string }). Numbers allow you to set
   * the HTTP status code. Objects allow you to overwrite the default message response that gets
   * generated. Instead of:
   *
   * ```ts
   * res.status(err.status || 500).json({ message: err.message || 'Something went wrong' })
   * ```
   *
   * you can instead do the following
   *
   * ```ts
   * res.status(err.status || 500).json(err.response)
   * ```
   * @returns
   */
  function HTTPErrorInit__create(
    ...args: (string | number | Record<string, unknown>)[]
  ): IHTTPError {
    let errorMessage: string | undefined;
    let errorStatus: number | undefined;
    let responseBody: Record<string, unknown> | undefined;
    args.forEach((arg) => {
      if (typeof arg === 'string') {
        errorMessage = arg;
      } else if (typeof arg === 'number') {
        errorStatus = arg;
      } else if (typeof arg === 'object') {
        responseBody = arg;
      }
    });

    const res: IHTTPError = new Error(errorMessage || 'Something went wrong');
    res.status = errorStatus || 500;
    res.type = 'httpError';
    res.response = responseBody;
    return res;
  }
  function HTTPErrorInit__isHTTPError(err: unknown) {
    const errAsHTTPErr = err as IHTTPError;
    return errAsHTTPErr.type === 'httpError' || !!errAsHTTPErr.status;
  }

  return {
    create: HTTPErrorInit__create,
    isHTTPError: HTTPErrorInit__isHTTPError,
  };
})();
