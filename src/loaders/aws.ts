import AWS from 'aws-sdk';
import { env } from '../config';

AWS.config.update(env.AWS_CONFIG);

export default {
  ses: function loadMailer() {
    console.log('Loading mailer...');

    let ses;
    if (env.NODE_ENV === 'testing') {
      ses = new TestSES();
      console.log('Test mailer loaded!');
    } else {
      ses = new AWS.SES(env.SES_CONFIG);
      console.log('Mailer loaded!');
    }

    return ses;
  },
  s3: function loadBucket() {
    console.log('Connecting to S3...');

    let s3;
    if (env.NODE_ENV === 'testing') {
      s3 = new TestS3Bucket();
      console.log('Test S3 connected!');
    } else {
      s3 = new AWS.S3();
      console.log('S3 connected!');
    }
    return s3;
  },
};

class TestSES {
  public send(...args: unknown[]) {
    return args;
  }
}

class TestS3Bucket {}
