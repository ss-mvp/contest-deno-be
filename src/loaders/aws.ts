import AWS from 'aws-sdk';
import { env } from '../config';

// Configure our AWS client with our credentials
AWS.config.update(env.AWS_CONFIG);

/**
 * An async loader function that creates an SES client, tests
 * that it's connected properly, then returns it.
 *
 * If `NODE_ENV === 'testing'` then a mocked client will be returned.
 */
export async function ses__loader() {
  console.log('Connecting to SES...');

  // Initialize a variable to store our client for return
  let ses;

  // If we're running tests, use a mock SES class
  if (env.NODE_ENV === 'testing') {
    ses = new TestSES();
    console.log('Test SES client connected!');
  } else {
    // Otherwise, let's create a standard SES client
    ses = new AWS.SES();

    try {
      // Verify our connection was successful
      const success = await ses
        .verifyDomainIdentity({ Domain: 'storysquad.app' })
        .promise();

      // If there's an error or no token, something is wrong!
      if (success.$response.error || !success?.VerificationToken) {
        console.log('SES error', success.$response.error);
        throw new Error('Could not verify SES');
      }

      // Otherwise, connection was successful and we can inject the SES client
      console.log('SES connected!');
    } catch (err) {
      console.warn('Could not connect to SES');
      console.warn(err);
    }
  }

  // Return the client for injection
  return ses;
}

/**
 * An async loader function that creates an S3 client, tests
 * that it's connected properly, then returns it.
 *
 * If `NODE_ENV === 'testing'` then a mocked client will be returned.
 */
export async function s3__loader() {
  console.log('Connecting to S3...');

  // Initialize a variable to store our client for return
  let s3;

  // If we're running tests, use a mock S3 class
  if (env.NODE_ENV === 'testing') {
    s3 = new TestS3();
    console.log('Test S3 connected!');
  } else {
    // Otherwise, let's create a standard S3 connection
    s3 = new AWS.S3();

    try {
      // Get the list of our buckets to test the connection
      const buckets = await s3.listBuckets().promise();

      // If there's an error or no buckets, something is wrong!
      if (buckets.$response.error || !buckets.Buckets) {
        throw new Error('Could not verify S3');
      }

      // Otherwise, we've connected successfully and can inject the S3 client
      console.log('S3 connected!');
    } catch (err) {
      console.warn('Could not connect to S3');
      console.warn(err);
    }
  }

  // Return the client for injection
  return s3;
}

// TODO build TestSES
class TestSES {}

// TODO build TestS3
class TestS3 {}
