import AWS from 'aws-sdk';
import { env } from '../config';

AWS.config.update(env.AWS_CONFIG);

export async function ses__loader() {
  console.log('Connecting to SES...');

  let ses;
  if (env.NODE_ENV === 'testing') {
    ses = new TestSES();
    console.log('Test SES client connected!');
  } else {
    ses = new AWS.SES({});
    try {
      const success = await ses
        .verifyDomainIdentity({ Domain: 'storysquad.app' })
        .promise();
      if (success.$response.error) throw success.$response.error;
    } catch (err) {
      console.warn('Could not connect to SES');
      console.warn(err);
    }
  }

  return ses;
}

export async function s3__loader() {
  console.log('Connecting to S3...');

  let s3;
  if (env.NODE_ENV === 'testing') {
    s3 = new TestS3Bucket();
    console.log('Test S3 connected!');
  } else {
    s3 = new AWS.S3();

    try {
      const buckets = await s3.listBuckets().promise();
      if (buckets.$response.error) throw buckets.$response.error;
      console.log('S3 connected!');
    } catch (err) {
      console.warn('Could not connect to S3');
      console.warn(err);
    }
  }
  return s3;
}

class TestSES {
  public send(...args: unknown[]) {
    return args;
  }
}

class TestS3Bucket {}
