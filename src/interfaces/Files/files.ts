import { middleware } from '../API';

/** This is what the `upload` middleware adds to the request body */
export interface IFileInRequest
  extends middleware.upload.IFileChecksum,
    middleware.upload.IResponse {}
