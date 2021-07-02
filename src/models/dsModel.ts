import Knex from 'knex';
import { Inject } from 'typedi';
import { Logger } from 'winston';
import { API, DS, Sources, Submissions, Users } from '../interfaces';

export default class DSModel {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('ds') protected dsDB: Knex
  ) {}

  public async addTranscription({
    uploadResponse,
    dsResponse,
    subItem,
    user,
    sourceId,
    transcription,
    transcriptionSourceId,
  }: {
    uploadResponse: API.middleware.upload.IResponseWithChecksum;
    dsResponse: DS.api.IDSAPITextSubmissionResponse;
    subItem: Submissions.ISubItem;
    user: Users.IUser;
    sourceId: number;
    transcription?: string;
    transcriptionSourceId: number;
  }) {
    try {
      this.logger.debug(`Adding sub ${subItem.id} to DS database`);
      await this.dsDB.transaction(async (trx) => {
        const dsSubId = await this.addSubmissionRow({
          confidence: dsResponse.Confidence,
          email: user.email,
          moderationFlag: dsResponse.ModerationFlag,
          originId: sourceId,
          originSubmissionId: subItem.id,
          rotation: dsResponse.Rotation,
          s3Checksum: uploadResponse.Checksum,
          s3Key: uploadResponse.s3Label,
          squadScore: dsResponse.SquadScore,
        });
        if (transcription) {
          await this.addTranscriptionRow({
            sourceId: transcriptionSourceId,
            transcription,
            submissionId: dsSubId,
          });
        }
        await this.addTranscriptionRow(
          {
            sourceId: DSTranscriptionSources.DS,
            transcription: dsResponse.Transcription,
            submissionId: dsSubId,
          },
          trx
        );
      });
      this.logger.debug(
        `Successfully added submission ${subItem.id} to DS database`
      );
    } catch (err) {
      this.logger.error('Error adding to DS database');
      this.logger.error(err);
      throw err;
    }
  }

  private async addSubmissionRow(
    sub: INewDSSubmissionRow,
    knexClient?: Knex
  ): Promise<number> {
    const client = knexClient ?? this.dsDB;
    const [{ id }] = await client<Submissions.ISubmission>(
      'submissions'
    ).insert(sub, '*');
    return id;
  }
  private addTranscriptionRow(
    tsc: INewDSTranscriptionRow,
    knexClient?: Knex
  ): Promise<void> {
    const client = knexClient ?? this.dsDB;
    return client('transcriptions').insert(tsc);
  }
}

// TODO move these to the right type file
interface INewDSSubmissionRow {
  email?: string;
  s3Key?: string;
  s3Checksum?: string;
  confidence?: number;
  squadScore?: number;
  rotation?: number;
  moderationFlag?: boolean;
  originSubmissionId?: number;
  originId?: Sources.DsTrscSrcEnum & number;
}
enum DSTranscriptionSources {
  'DS' = 1,
  'iOS' = 2,
}
interface INewDSTranscriptionRow {
  transcription?: string;
  sourceId?: DSTranscriptionSources & number;
  submissionId?: number;
}
