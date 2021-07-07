export interface IFlag extends INewFlag {
  id: number;
}

export interface INewFlag {
  flag: string;
}

export enum FlagEnum {
  Content = 1,
}

/**
 * This interface represents the object in the `submission_flags`
 * table that establishes a many-to-many relationship between the
 * `submissions` table and the `enum_flags` table.
 *
 * It also allows us to set the creatorId, which is the id of the user
 * who is adding the flag to the submission.
 *
 * > Xref just means cross-reference
 */

export interface ISubFlagXref extends INewSubFlagXref {
  id: number;
}

export interface INewSubFlagXref {
  submissionId: number;
  flagId: number;
  creatorId?: number;
}

/**
 * Gets the id of the `submission_flags` table, since there is already
 * a `flagId` field on the object
 */
export interface IFlagItem extends ISubFlagXref, Omit<IFlag, 'id'> {}
