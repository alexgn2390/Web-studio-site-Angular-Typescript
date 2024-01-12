export type CommentActionsType= {
  comment: string,
  action: Likes
}

export enum Likes {
  like = 'like',
  dislike = 'dislike'
}

export enum FeedbackLikes {
  like = 'like',
  dislike = 'dislike',
  violate = 'violate'
}
