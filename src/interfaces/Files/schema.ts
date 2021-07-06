import { Joi } from 'celebrate';
import { middleware } from '../API';

/**
 * Schema options will by default restrict file upload, you must
 * explicity allow for multi-file upload on endpoints.
 */
interface IFileSchemaOptions {
  /** Minumum number of files in one field, defaults to 1 */
  minFiles?: number;
  /** Maximum number of files in one field, defaults to 1 */
  maxFiles?: number;

  // /** Maximum number of files across all fields */
  // fileLimit?: number;

  /** Optionally declare file field names in object format */
  fileNames?: string[];
}

export default (function fileSchema__Generator() {
  function fileSchema__create(...options: (IFileSchemaOptions | string)[]) {
    let optionObj: IFileSchemaOptions = {};
    const fileList: string[] = [];
    options.forEach((op) => {
      if (typeof op === 'string') fileList.push(op);
      else {
        optionObj = Object.assign(optionObj, op);
        // If any filenames were specified on the object, add them to tracking array
        optionObj.fileNames && fileList.push(...optionObj.fileNames);
      }
    });

    const minFiles = optionObj.minFiles || 1;
    const maxFiles = optionObj.maxFiles || 1;

    const schema: Record<string, ReturnType<typeof Joi['array']>> = {};

    fileList.forEach((fname) => {
      schema[fname] = Joi.array()
        .min(minFiles)
        .max(maxFiles)
        .required()
        .items(
          Joi.object<middleware.upload.IResponseWithChecksum>({
            filekey: Joi.string().allow(fname),
          })
        );
    });

    return Joi.object(schema).options({
      abortEarly: false,
      allowUnknown: true,
    });
  }

  return {
    create: fileSchema__create,
  };
})();
