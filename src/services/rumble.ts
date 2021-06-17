import {
  createError,
  Inject,
  moment,
  Service,
  serviceCollection,
  v5,
} from '../../deps.ts';
import env from '../config/env.ts';
import {
  ISection,
  ISectionPostBody,
  ISectionWithRumbles,
} from '../interfaces/cleverSections.ts';
import { IStudentWithSubmissions } from '../interfaces/cleverStudents.ts';
import { Roles } from '../interfaces/roles.ts';
import { IRumbleFeedback } from '../interfaces/rumbleFeedback.ts';
import {
  IRumblePostBody,
  IRumbleWithSectionInfo,
} from '../interfaces/rumbles.ts';
import { ISubItem } from '../interfaces/submissions.ts';
import { IUser } from '../interfaces/users.ts';
import CleverSectionModel from '../models/cleverSections.ts';
import CleverStudentModel from '../models/cleverStudents.ts';
import CleverTeacherModel from '../models/cleverTeachers.ts';
import RumbleFeedbackModel from '../models/rumbleFeedback.ts';
import RumbleModel from '../models/rumbles.ts';
import RumbleSectionsModel from '../models/rumbleSections.ts';
import SubmissionModel from '../models/submissions.ts';
import UserModel from '../models/users.ts';
import BaseService from './baseService.ts';
import DSService from './dsService.ts';
import SubmissionService from './submission.ts';

@Service()
export default class RumbleService extends BaseService {
  constructor(
    @Inject(UserModel) private userModel: UserModel,
    @Inject(DSService) private dsService: DSService,
    @Inject(RumbleModel) private rumbleModel: RumbleModel,
    @Inject(SubmissionModel) private subModel: SubmissionModel,
    @Inject(SubmissionService) private subService: SubmissionService,
    @Inject(CleverTeacherModel) private teacherModel: CleverTeacherModel,
    @Inject(CleverStudentModel) private studentModel: CleverStudentModel,
    @Inject(CleverSectionModel) private sectionModel: CleverSectionModel,
    @Inject(RumbleSectionsModel) private rumbleSections: RumbleSectionsModel,
    @Inject(RumbleFeedbackModel) private rumbleFeedback: RumbleFeedbackModel
  ) {
    super();
  }

  public async getSubsForFeedback(
    studentId: number,
    rumbleId: number
  ): Promise<ISubItem[]> {
    try {
      this.logger.debug(
        `Getting submissions for feedback for user ${studentId}`
      );

      const submissions = await this.subModel.getSubsForFeedback(
        studentId,
        rumbleId
      );

      const subPromises = submissions.map((s) =>
        this.subService.retrieveSubItem(s)
      );

      const subItems = await Promise.all(subPromises);

      return subItems;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getById(
    rumbleId: number
  ): Promise<IRumbleWithSectionInfo | undefined> {
    try {
      this.logger.debug('Getting rumble with ID', rumbleId);

      const [rumble] = await this.rumbleModel.get({ id: rumbleId });
      if (!rumble) return undefined;

      const processedRumble = await this.rumbleModel.getRumbleInfo(rumble);
      console.log({ processedRumble });

      this.logger.debug('Got rumble with id', rumbleId);
      return processedRumble;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async addScoresToFeedback(feedback: IRumbleFeedback[]): Promise<void> {
    try {
      this.logger.debug(`Updating feedback scores...`);

      const feedbackPromises = feedback.map(({ id, ...body }) => {
        return this.rumbleFeedback.updateFeedback(body);
      });

      await this.db.transaction(async () => {
        await Promise.all(feedbackPromises);
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getSections(user: IUser) {
    try {
      this.logger.debug(`Getting sections for user ${user.id}`);

      let sections: ISection[];
      if (user.roleId === Roles.teacher) {
        sections = await this.teacherModel.getSectionsById(user.id);
      } else if (user.roleId === Roles.user) {
        sections = await this.studentModel.getSectionsById(user.id);
      } else {
        throw createError(401, 'Invalid user type!');
      }

      await this.getActiveRumblesForSections(sections as ISectionWithRumbles[]);

      return sections as ISectionWithRumbles[];
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getActiveRumblesForSections(sections: ISectionWithRumbles[]) {
    try {
      for await (const section of sections) {
        const rumbleArray = await this.rumbleModel.getActiveRumblesBySection(
          section
        );
        section.rumbles = rumbleArray.map((r) => ({
          ...r,
          sectionId: section.id,
          sectionName: section.name,
        }));
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getStudentsInSection(sectionId: number) {
    // Leaving this in the service to open us up for more data later
    try {
      this.logger.debug(
        `Attempting to retrieve students from section ${sectionId}`
      );

      const students = await this.sectionModel.getStudentsBySectionId(
        sectionId
      );

      for await (const student of students) {
        const subs = await this.getSubsByStudentAndSection(
          student.id,
          sectionId
        );
        student.submissions = subs;
      }

      return students;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getSubsByStudentAndSection(
    studentId: number,
    sectionId: number
  ): Promise<ISubItem[]> {
    try {
      this.logger.debug(
        `Attempting to retrieve codename for student with id ${studentId}`
      );
      const [{ codename }] = await this.userModel.get({ id: studentId });

      this.logger.debug(
        `Attempting to retrieve submissions for student with id ${studentId} in section ${sectionId}`
      );
      const basicSubs = await this.subModel.getSubsForStudentInSection(
        studentId,
        sectionId
      );

      this.logger.debug(
        `Attempting to process submission data for student with id ${studentId}`
      );
      const subPromises = basicSubs.map((s) =>
        this.subService.retrieveSubItem(s, codename)
      );
      const subItems = Promise.all(subPromises);

      return subItems;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getStudentsWithSubForRumble(
    rumbleId: number
  ): Promise<IStudentWithSubmissions[]> {
    try {
      this.logger.debug(
        `Attempting to retrieve students in rumble ${rumbleId}`
      );

      const students = await this.rumbleModel.getStudentsByRumbleId(rumbleId);

      for await (const student of students) {
        const sub = await this.subModel.getSubByStudentAndRumbleId(
          student.id,
          rumbleId
        );
        if (sub) {
          const subItem = await this.subService.retrieveSubItem(
            sub,
            student.codename
          );
          student.submissions = [subItem];
        } else student.submissions = [];
      }

      return students;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getSubForStudentByRumble(
    rumbleId: number,
    studentId: number
  ): Promise<ISubItem | undefined> {
    try {
      const sub = await this.subModel.getSubByStudentAndRumbleId(
        studentId,
        rumbleId
      );
      // If no sub is found, return undefined
      if (!sub) return undefined;

      const subItem = await this.subService.retrieveSubItem(sub);
      return subItem;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async createSection(body: ISectionPostBody, teacherId: number) {
    try {
      this.logger.debug(
        `Attempting to add section '${body.name}' for teacher with id ${teacherId}`
      );

      let section: ISection | undefined;
      await this.db.transaction(async () => {
        const joinCode = this.generateJoinCode(body.name);
        // Transactions mantain data integrity when creaing multiple rows
        const [res] = await this.sectionModel.add({
          joinCode,
          active: true,
          gradeId: body.gradeId,
          name: body.name,
          subjectId: body.subjectId,
        });

        await this.teacherModel.add({
          primary: true,
          sectionId: res.id,
          userId: teacherId,
        });

        section = res;
      });
      if (section) return section;
      else throw createError(400, 'Could not create section');
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async addChildToSection(
    joinCode: string,
    sectionId: number,
    studentId: number
  ): Promise<ISectionWithRumbles> {
    try {
      // Get the section with the given id
      const section = await this.sectionModel.get(
        { id: sectionId },
        { first: true }
      );
      // Handle nonexistent section
      if (!section) {
        throw createError(404, 'Invalid section ID');
      }
      // Handle incorrect join code
      if (joinCode !== section.joinCode) {
        throw createError(401, 'Join code is invalid');
      }

      // Connect the student user to the section
      await this.studentModel.add({
        sectionId: section.id,
        userId: studentId,
      });

      const rumbles = await this.rumbleModel.getActiveRumblesBySection(section);

      return { ...section, rumbles };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async createGameInstances(
    body: IRumblePostBody,
    sectionIds: number[]
  ): Promise<IRumbleWithSectionInfo[]> {
    try {
      const rumbles: IRumbleWithSectionInfo[] = [];
      await this.db.transaction(async () => {
        for await (const sectionId of sectionIds) {
          const joinCode = this.generateJoinCode(
            `${body.numMinutes}-${body.promptId}`
          );

          const [res] = await this.rumbleModel.add({
            joinCode,
            canJoin: false,
            maxSections: 1,
            numMinutes: body.numMinutes,
            promptId: body.promptId,
          });

          await this.rumbleSections.add({
            rumbleId: res.id,
            sectionId,
          });

          const [{ name }] = await this.sectionModel.get({ id: sectionId });

          rumbles.push({ ...res, sectionName: name, sectionId });
        }
        // if (rumbles.length !== sections.length)
        //   throw createError(409, 'Unable to create rumbles');
      });
      return rumbles;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async startRumble(sectionId: number, rumbleId: number) {
    try {
      // Get the rumble based off of the ID to know the desired game length
      const rumble = await this.rumbleModel.get(
        { id: rumbleId },
        { first: true }
      );

      // Calculate the end time from the game length
      const endTime = this.calculateEndTime(rumble.numMinutes);

      // Update the end time of the given rumble
      await this.rumbleSections.updateEndTime(endTime, sectionId, rumbleId);

      // Return the end time to the user
      return endTime;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async startFeedback(rumbleId: number): Promise<void> {
    try {
      const subs = await this.subModel.getFeedbackIDsByRumbleID(rumbleId);
      console.log('subs to be processed for feedback', subs);

      // Return early! Nothing to generate.
      // TODO - should we throw an error for this??
      if (subs.length === 0 || !subs) return;

      const matchups = this.dsService.generateFeedbackMatchups(subs);

      // Get the ID of the cross-reference that connects a section to a rumble
      // TODO make sure this works
      const { id: rumbleSectionId } = await this.rumbleSections.get(
        { rumbleId },
        { first: true }
      );

      await this.db.transaction(async () => {
        await this.rumbleSections.update(rumbleSectionId, {
          phase: 'FEEDBACK',
        });
        await this.rumbleFeedback.add(matchups);
        // If it successfully adds these rows, the promise is resolved and we end the query
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private generateJoinCode(key: string) {
    try {
      this.logger.debug(`Generating join code with key: '${key}'`);

      const joinCode = v5.generate({
        namespace: env.UUID_NAMESPACE,
        value: `${key}-${Date.now()}`,
      }) as string;

      this.logger.debug(`Join code generated for key: '${key}'`);

      return joinCode;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private calculateEndTime(numMinutes: number): Date {
    return (moment.utc().add(numMinutes, 'm') as unknown) as Date;
  }
}

serviceCollection.addTransient(RumbleService);
