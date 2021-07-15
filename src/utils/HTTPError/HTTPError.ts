import { AxiosError } from 'axios';
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

    // Create a standard error object
    const res: IHTTPError = new Error(errorMessage || 'Something went wrong');

    // Extend that standard error object
    res.status = errorStatus || 500; // Default status to 500
    res.type = 'httpError'; // This is a flag for us to use in the isHTTPError checker
    res.response = responseBody; // This has no default, and can be undefined

    // Customize our error object's toString functionality
    res.toString = function () {
      // Here we define a stringified value with the values that we already processed above
      return `[HTTPError:${res.status}] ${
        // Display the custom response if there is one, else print the message
        res.response ? JSON.stringify(res.response) : res.message
      }`;
    };

    return res;
  }
  function HTTPErrorInit__isHTTPError(err: unknown): err is IHTTPError {
    const errAsHTTPErr = err as IHTTPError;
    return errAsHTTPErr.type === 'httpError' || !!errAsHTTPErr.status;
  }
  function HTTPErrorInit__isAxiosError(err: unknown): err is AxiosError {
    const errAsAxiosErr = err as AxiosError;
    return errAsAxiosErr.isAxiosError;
  }

  return {
    create: HTTPErrorInit__create,
    isHTTPError: HTTPErrorInit__isHTTPError,
    isAxiosError: HTTPErrorInit__isAxiosError,
  };
})();
