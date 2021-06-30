// RumbleFeedback will always have an ID and 3 scores
export interface IFeedbackItem extends INewFeedbackItem {
  id: number;
  score1: number;
  score2: number;
  score3: number;
}

// A new piece of feedback should contain the Voters ID & the submission ID is the 1 of 3 submissions said voter is providing feedback on. In a perfect rumble instance each voter will create 3 INewRumbleFeedback's
export interface INewFeedbackItem {
  voterId: number;
  submissionId: number;
}

// TODO - start thinking of other interfaces we will need in for the feedback features.
