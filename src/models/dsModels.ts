import {
  Inject,
  log,
  PostgresAdapter,
  QueryValues,
  serviceCollection,
} from '../../deps';
import {
  IDSAPIPageSubmission,
  IDSAPITextSubmissionResponse,
} from '../interfaces/dsServiceTypes';
import { Sources } from '../interfaces/enumSources';
import { ISubItem } from '../interfaces/submissions';
import { IUser } from '../interfaces/users';

export default class DSModel {
  protected dsDB: PostgresAdapter;
  constructor(@Inject('logger') private logger: log.Logger) {
    this.dsDB = serviceCollection.get('ds');
  }

  public async addTranscription({
    uploadResponse,
    dsResponse,
    subItem,
    user,
    sourceId,
    transcription,
    transcriptionSourceId,
  }: {
    uploadResponse: IDSAPIPageSubmission;
    dsResponse: IDSAPITextSubmissionResponse;
    subItem: ISubItem;
    user: IUser;
    sourceId: number;
    transcription?: string;
    transcriptionSourceId: number;
  }) {
    try {
      this.logger.debug(`Adding sub ${subItem.id} to DS database`);
      await this.dsDB.transaction(async () => {
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
        await this.addTranscriptionRow({
          sourceId: DSTranscriptionSources.DS,
          transcription: dsResponse.Transcription,
          submissionId: dsSubId,
        });
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

  private async addSubmissionRow(sub: INewDSSubmissionRow): Promise<number> {
    const [{ id }] = ((await this.dsDB
      .table('submissions')
      .insert((sub as unknown) as QueryValues)
      .returning('id')
      .execute()) as unknown) as { id: number }[];
    return id;
  }
  private addTranscriptionRow(tsc: INewDSTranscriptionRow): Promise<unknown> {
    return this.dsDB
      .table('transcriptions')
      .insert((tsc as unknown) as QueryValues)
      .execute();
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
  originId?: Sources & number;
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

serviceCollection.addTransient(DSModel);
