import { NextFunction, Request, Response } from 'express';
import { Form } from 'multiparty';
import Container from 'typedi';
import { Logger } from 'winston';

// TODO test formParser
export default function formParserGenerator() {
  return async function formParserMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const logger: Logger = Container.get('logger');
    try {
      const form = new Form();
      form.parse(
        req,
        async function formParser__multpartyParse__callback(
          err,
          fields,
          files
        ) {
          if (files) {
            const files: Record<string, File[]> = {};
            const fileFieldNames = Object.keys(files);
            for (const f of fileFieldNames) {
              const fileList = files[f] as File | File[];
              if (Array.isArray(fileList)) {
                files[f] = fileList;
              } else {
                files[f] = [fileList];
              }
            }
            req.body = { ...req.body, ...files };
          }
          if (fields) {
            req.body = { ...req.body, ...fields };
          }
          console.log(req.body);
          next();
        }
      );
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  };
}
