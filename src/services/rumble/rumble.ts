import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { v5 } from 'uuid';
import { env } from '../../config';
import {
  Clever,
  Feedback,
  Roles,
  Rumbles,
  Submissions,
  Users,
} from '../../interfaces';
import {
  CleverSectionModel,
  CleverStudentModel,
  CleverTeacherModel,
  RumbleFeedbackModel,
  RumbleModel,
  RumbleSectionsModel,
  SubmissionModel,
  UserModel,
} from '../../models';
import { HTTPError } from '../../utils';
import BaseService from '../baseService';
import { DSService } from '../ds';
import { SubmissionService } from '../submission';

@Service()
export default class RumbleService extends BaseService {
  constructor(
    private userModel: UserModel,
    private dsService: DSService,
    private rumbleModel: RumbleModel,
    private subModel: SubmissionModel,
    private subService: SubmissionService,
    private teacherModel: CleverTeacherModel,
    private studentModel: CleverStudentModel,
    private sectionModel: CleverSectionModel,
    private rumbleSections: RumbleSectionsModel,
    private rumbleFeedback: RumbleFeedbackModel
  ) {
    super();
  }

  public async getSubsForFeedback(
    studentId: number,
    rumbleId: number
  ): Promise<Submissions.ISubItem[]> {
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
  ): Promise<Rumbles.IRumbleWithSectionInfo | undefined> {
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

  public async addScoresToFeedback(
    feedback: Feedback.IFeedbackItem[]
  ): Promise<void> {
    try {
      this.logger.debug(`Updating feedback scores...`);

      const feedbackPromises = feedback.map(({ ...body }) => {
        // Remove the ID from the body
        Reflect.deleteProperty(body, 'id');
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

  public async getSections(user: Users.IUser) {
    try {
      this.logger.debug(`Getting sections for user ${user.id}`);

      let sections: Clever.sections.ISection[];
      if (user.roleId === Roles.RoleEnum.teacher) {
        sections = await this.teacherModel.getSectionsById(user.id);
      } else if (user.roleId === Roles.RoleEnum.user) {
        sections = await this.studentModel.getSectionsById(user.id);
      } else {
        throw HTTPError.create(401, 'Invalid user type!');
      }

      await this.getActiveRumblesForSections(
        sections as Clever.sections.ISectionWithRumbles[]
      );

      return sections as Clever.sections.ISectionWithRumbles[];
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async getActiveRumblesForSections(
    sections: Clever.sections.ISectionWithRumbles[]
  ) {
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
  ): Promise<Submissions.ISubItem[]> {
    try {
      this.logger.debug(
        `Attempting to retrieve codename for student with id ${studentId}`
      );
      const [user] = await this.userModel.get({ id: studentId });

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
        this.subService.retrieveSubItem(s, user)
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
  ): Promise<Clever.students.IStudentWithSubmissions[]> {
    try {
      this.logger.debug(
        `Attempting to retrieve students in rumble ${rumbleId}`
      );

      const students = (await this.rumbleModel.getStudentsByRumbleId(
        rumbleId
      )) as Clever.students.IStudentWithSubmissions[];

      for await (const student of students) {
        const sub = await this.subModel.getSubByStudentAndRumbleId(
          student.id,
          rumbleId
        );
        if (sub) {
          const subItem = await this.subService.retrieveSubItem(sub, student);
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
  ): Promise<Submissions.ISubItem | undefined> {
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

  public async createSection(
    body: Clever.sections.ISectionPostBody,
    teacherId: number
  ) {
    try {
      this.logger.debug(
        `Attempting to add section '${body.name}' for teacher with id ${teacherId}`
      );

      let section: Clever.sections.ISection | undefined;
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
      else throw HTTPError.create(400, 'Could not create section');
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async addChildToSection(
    joinCode: string,
    sectionId: number,
    studentId: number
  ): Promise<Clever.sections.ISectionWithRumbles> {
    try {
      // Get the section with the given id
      const section = await this.sectionModel.get(
        { id: sectionId },
        { first: true }
      );
      // Handle nonexistent section
      if (!section) {
        throw HTTPError.create(404, 'Invalid section ID');
      }
      // Handle incorrect join code
      if (joinCode !== section.joinCode) {
        throw HTTPError.create(401, 'Join code is invalid');
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

  public async createGameInstances({
    rumble,
    sectionIds,
  }: {
    rumble: Rumbles.IRumblePostBody;
    sectionIds: number[];
  }): Promise<Rumbles.IRumbleWithSectionInfo[]> {
    try {
      const rumbles: Rumbles.IRumbleWithSectionInfo[] = [];
      await this.db.transaction(async () => {
        for await (const sectionId of sectionIds) {
          const joinCode = this.generateJoinCode(
            `${rumble.numMinutes}-${rumble.promptId}`
          );
          const endTime = DateTime.fromISO(rumble.start_time as string)
            .plus({
              minutes: rumble.numMinutes,
            })
            .toISO() as unknown;

          const [res] = await this.rumbleModel.add({
            joinCode,
            canJoin: false,
            maxSections: 1,
            numMinutes: rumble.numMinutes,
            promptId: rumble.promptId,
          });

          await this.rumbleSections.add({
            rumbleId: res.id,
            start_time: rumble.start_time,
            sectionId,
            end_time: endTime as Date,
          });

          const [{ name }] = await this.sectionModel.get({ id: sectionId });

          rumbles.push({
            ...res,
            sectionName: name,
            sectionId,
            end_time: endTime as Date,
            start_time: rumble.start_time as Date,
          });
        }
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
      const endTime = DateTime.utc()
        .plus({
          minutes: rumble.numMinutes,
        })
        .toISO() as unknown;

      // Update the end time of the given rumble
      await this.rumbleSections.updateEndTime(
        endTime as Date,
        sectionId,
        rumbleId
      );

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
      if (subs.length < 2 || !subs)
        HTTPError.create(400, 'Not enough submissions to start feedback phase');

      const matchups = this.dsService.generateFeedbackMatchups(subs);

      // Get the ID of the cross-reference that connects a section to a rumble
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

      const joinCode = v5(`${key}-${Date.now()}`, env.UUID_NAMESPACE);

      this.logger.debug(`Join code generated for key: '${key}'`);

      return joinCode;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
