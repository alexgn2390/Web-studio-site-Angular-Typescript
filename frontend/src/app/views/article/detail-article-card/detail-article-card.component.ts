import {Component, OnDestroy, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DetailArticleType} from "../../../../types/detail-article.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {ArticleType} from "../../../../types/article.type";
import {AuthService} from "../../../shared/services/auth.service";
import {CommentService} from "../../../shared/services/comment.service";
import {HttpErrorResponse} from "@angular/common/http";
import {AddCommentType} from "../../../../types/add-comment.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GetCommentsType} from "../../../../types/get-comments.type";
import {CommentActionsType} from "../../../../types/comment-actions.type";
import {UserInfoService} from "../../../shared/services/user-info.service";
import {CommentType} from "../../../../types/comment.type";
import {FormBuilder, Validators} from "@angular/forms";
import {concatMap, Subscription, switchMap, tap} from "rxjs";

enum IconState {
  Like = 'like',
  Dislike = 'dislike',
  Neutral = 'neutral',
}

@Component({
  selector: 'app-detail-article-card',
  templateUrl: './detail-article-card.component.html',
  styleUrls: ['./detail-article-card.component.scss'],

})


export class DetailArticleCardComponent implements OnInit, OnDestroy {
  textInForm = this.fb.group({
    text: ['', Validators.required],
  })

  detailArticle: DetailArticleType
  serverStaticPathDetail = environment.serverStaticPathDetail
  articleCard: ArticleType[] = []
  isLogged: boolean = false
  comments: GetCommentsType
  // allActions: CommentActionsType[]
  actionUser: CommentActionsType[]
  iconState: IconState = IconState.Neutral;
  isIconDisabled = false;
  loadCommentButton: boolean = false
  commentNo: boolean = false
  // addCommentUp: DefaultResponseType | AddCommentType | null = null
  displayedComments: CommentType[] = [];
  // commentDate: string = ''
  // countLikes: number = 0
  commentPostSub: Subscription | null = null
  relatedArticles: ArticleType[] = []

  limit: number = 3
  offset: number = 0 //Значение для количества урезания комментариев, сами высчитываем
  allCount: number = 0; //Общее количество комментариев для текущей статьи, нужно для цикла, получаем с бэкенда
  beginMaxCount: number = 3; //Вначале показываются последние три (константа) комментария, потом при нажатии кнопки если есть ещё кол-во не показанных комментариев, то будут показываться по +10 пока не закончатся
  private mediumFactor: number = 10; //Коэффициент-константа умножения на кол-во нажатий на кнопку: для вывода количества комментариев, которые дополнительно будут показываться если есть
  private clickAddCounts: number = 0; //Количество нажатий на кнопку <Показать ещё>
  existComments: boolean = false; //Есть ли комментарий в этой статье (для связывания условий article и commentArticle в html-файле)



  constructor(private detailArticleService: ArticlesService,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private commentService: CommentService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private userInfoService: UserInfoService,
              private fb: FormBuilder) {
    this.isLogged = this.authService.getIsLoggedIn()
    this.detailArticle = {
      text: "",
      comments: [],
      commentsCount: 0,
      id: "",
      title: "",
      description: "",
      image: "",
      date: "",
      category: "",
      url: ""
    }
    this.comments = {
      allCount: 0,
      comments: []
    }
    this.actionUser = []
    // this.allActions = []
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn
    })

    this.dataFromBackend()

  }

  dataFromBackend() {
    this.activatedRoute.params.subscribe(params => {
      this.detailArticleService.getDetailArticle(params['url'])
        .subscribe((data: DetailArticleType | DefaultResponseType) => {
          this.detailArticle = data as DetailArticleType
          if (this.detailArticle && this.detailArticle.id) {
            this.commentService.getComments(this.offset, this.detailArticle.id)
              .subscribe((data: GetCommentsType | DefaultResponseType) => {
                this.allCount = (data as GetCommentsType).allCount;
                this.comments = data as GetCommentsType
                this.commentNo = (this.comments && this.comments.allCount >= 1);
                this.getComments()
              })
          }
        })
      this.detailArticleService.getDetailArticleRelated(params['url']).subscribe((data: ArticleType[]): void => {
        this.relatedArticles = data;
      });
    })
  }

  addComment() {
    if (this.textInForm.valid && this.textInForm.value.text) {
      this.commentPostSub =
        this.commentService.addComments(this.textInForm.value.text, this.detailArticle.id)
          .subscribe({
            next: () => {
              this.dataFromBackend()
              this.textInForm.reset();
            },
            error: (errorResponse: HttpErrorResponse) => {
              if (errorResponse.error && errorResponse.error.error) {
                this._snackBar.open(errorResponse.error.message)
              } else {
                throw new Error(errorResponse.message)
              }
            }
          })
    }
  }

  loadComment(): void {
    this.getComments();
    this.clickAddCounts++;
  }


  getComments() {
    this.offset = (this.allCount - this.beginMaxCount - (this.mediumFactor * this.clickAddCounts) < 1)
      ? 0 : (this.allCount - this.beginMaxCount - (this.mediumFactor * this.clickAddCounts));
    this.commentService.getComments(this.offset, this.detailArticle.id)
      .subscribe((data: GetCommentsType | DefaultResponseType) => {
        if (this.detailArticle.id) {
          this.commentService.getAllCommentActions(this.detailArticle.id).subscribe(
            (commentActions: DefaultResponseType | CommentActionsType[]) => {
              if ((commentActions as DefaultResponseType).error) {
                this._snackBar.open((commentActions as DefaultResponseType).message);
                throw new Error((commentActions as DefaultResponseType).message);
              }
              if ((commentActions as CommentActionsType[]) && (commentActions as CommentActionsType[]).length > 0) {
                (data as GetCommentsType).comments.forEach((comment: CommentType) => {
                  (commentActions as CommentActionsType[]).forEach((commentAction: CommentActionsType) => {
                    if (comment.id === commentAction.comment && commentAction.action) {
                      if (commentAction.action === 'like') {
                        comment.likeVoice = true;
                      } else if (commentAction.action === 'dislike') {
                        comment.dislikeVoice = true;
                      }
                    }
                  });
                });
              }
            }
          );
          this.comments = data as GetCommentsType;
        }
        // this.loaderService.hide();
      });
  }

  processDate(date: string): string {
    if (date) {
      const components = date.split(' ')
      const dateComponents = components[0].split('-',);
      const year = dateComponents[0];
      const month = dateComponents[1];

      const days = dateComponents[2].split('T');
      const day = days[0]

      const times = days[1].split('.')
      const time = times[0].split(':')

      const hours = time[0]
      const minutes = time[1]
      return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
    }
    return ''
  }

  increaseCount(idComment: string) {
    if (this.isIconDisabled) return;
    this.isIconDisabled = true;
    this.commentService.applyActionComment(idComment, IconState.Like).subscribe({
      next: (data: DefaultResponseType | AddCommentType) => {
        if ((data as DefaultResponseType).error) {
          const error = (data as DefaultResponseType).message;
          this._snackBar.open(error);
          throw new Error(error);
        } else {
          this.commentService.getCommentActionsUser(idComment)
            .subscribe(data => {
              this.actionUser = data
              const commentToUpdate = this.comments.comments.find(comment => comment.id === idComment);
              // console.log(this.actionUser)
              if (commentToUpdate) {
                if (this.iconState === IconState.Like && commentToUpdate.likesCount > 0) {
                  commentToUpdate.likesCount--;
                  this.iconState = IconState.Neutral;
                } else if (this.iconState === IconState.Dislike) {
                  commentToUpdate.dislikesCount--;
                  commentToUpdate.likesCount++;
                  this.iconState = IconState.Like;
                  this._snackBar.open('Ваш голос учтен');
                } else {
                  commentToUpdate.likesCount++;
                  localStorage.setItem(`likesCount_${idComment}`, commentToUpdate.likesCount.toString());
                  this.iconState = IconState.Like;
                  this._snackBar.open('Ваш голос учтен');
                }
              }
            })
        }
        this.isIconDisabled = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.isIconDisabled = false;
        if (errorResponse.error && errorResponse.error.message) {
          this._snackBar.open(errorResponse.error.message);
        }
      }
    });
  }

  decreaseCount(idComment: string): void {
    if (this.isIconDisabled) return;
    this.isIconDisabled = true;
    this.commentService.applyActionComment(idComment, IconState.Dislike).subscribe({
      next: (data: DefaultResponseType) => {
        if ((data as DefaultResponseType).error) {
          const error = (data as DefaultResponseType).message;
          this._snackBar.open(error);
          throw new Error(error);
        } else {
          this.commentService.getCommentActionsUser(idComment)
            .subscribe(data => {
              this.actionUser = data
              const commentToUpdate = this.comments.comments.find(comment => comment.id === idComment);
              if (commentToUpdate) {
                if (this.iconState === IconState.Dislike && commentToUpdate.dislikesCount > 0) {
                  commentToUpdate.dislikesCount--;
                  this.iconState = IconState.Neutral;
                } else if (this.iconState === IconState.Like) {
                  commentToUpdate.likesCount--;
                  commentToUpdate.dislikesCount++;
                  this.iconState = IconState.Dislike;
                } else {
                  commentToUpdate.dislikesCount++;
                  this.iconState = IconState.Dislike;
                  this._snackBar.open('Ваш голос учтен');
                }
              }
            })
        }
        this.isIconDisabled = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.isIconDisabled = false;
        if (errorResponse.error && errorResponse.error.message) {
          this._snackBar.open(errorResponse.error.message);
        }
      }
    });
  }

  violetRequest(idComment: string): void {
    const violate = 'violate'
    this.commentService.applyActionComment(idComment, violate)
      .subscribe({
        next: (data: DefaultResponseType | AddCommentType) => {
          if ((data as DefaultResponseType).error) {
            const error = (data as DefaultResponseType).message;
            this._snackBar.open(error);
            throw new Error(error);
          } else {
            this._snackBar.open('Жалоба отправлена');
          }
          this.isIconDisabled = false;
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.isIconDisabled = false;
          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open('Жалоба уже отправлена');
          }
        }
      });
  }


  ngOnDestroy(): void {
    this.commentPostSub?.unsubscribe()
  }
}



//
//   ngOnInit(): void {
//     this.activatedRoute.params.subscribe(params => {
//       this.detailArticleService.getDetailArticle(params['url'])
//         .subscribe((data: DetailArticleType | DefaultResponseType) => {
//           this.detailArticle = data as DetailArticleType
//           // console.log(this.detailArticle)
//           this.getComments()
//           // this.reactionsWithComments()
//         })
//       this.detailArticleService.getDetailArticleRelated(params['url'])
//         .subscribe((data: ArticleType[]) => {
//           this.articleCard = data
//           // console.log(this.articleCard)
//         })
//     })
//     this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
//       this.isLogged = isLoggedIn
//     })
//   }
//
//   addComment(): void {
//     if (this.textInForm.valid && this.textInForm.value.text) {
//       this.commentPostSub = this.commentService.addComments(this.textInForm.value.text, this.detailArticle.id)
//         .pipe(
//           concatMap(() => this.commentService.getComments(this.offset, this.detailArticle.id)),
//           tap(response => {
//             if ('comments' in response && response.comments.length > 0) {
//               const addCommentResponse: GetCommentsType = response as GetCommentsType;
//               const firstComment = response.comments[0];
//
//               const newComment = {
//                 id: firstComment.id,
//                 text: firstComment.text,
//                 date: firstComment.date,
//                 likesCount: firstComment.likesCount,
//                 dislikesCount: firstComment.dislikesCount,
//                 user: {
//                   id: firstComment.user.id,
//                   name: firstComment.user.name
//                 }
//                 // Другие поля CommentType, если они есть
//               };
//
//               this.displayedComments.unshift(newComment);
//               this.textInForm.reset();
//             }
//           })
//         )
//         .subscribe(
//           () => {
//           },
//           (errorResponse: HttpErrorResponse) => {
//             if (errorResponse.error && errorResponse.error.error) {
//               this._snackBar.open(errorResponse.error.message);
//             } else {
//               throw new Error(errorResponse.message);
//             }
//           }
//         );
//     }
//   }
//
//   getComments(): void {
//     this.commentService.getComments(this.offset, this.detailArticle.id).subscribe(data => {
//       this.comments = data as GetCommentsType;
//       this.displayedComments = this.comments.comments.slice(0, this.limit);
//       this.loadCommentButton = this.comments.allCount > this.limit;
//       if (this.comments.allCount === 0) {
//         this.commentNo = true
//       } else {
//         this.commentNo = false
//       }
//       console.log(this.displayedComments);
//     });
//
//   }
//
//
//   loadComment(): void {
//     this.offset += this.limit;
//     this.commentService.getComments(this.offset, this.detailArticle.id).subscribe({
//       next: (data: GetCommentsType | DefaultResponseType) => {
//         this.comments = data as GetCommentsType
//         if ('comments' in this.comments) {
//           // Проверяем, есть ли поле 'comments' в данных, чтобы убедиться, что это GetCommentsType
//           this.displayedComments = this.displayedComments.concat(this.comments.comments);
//         }
//         if (this.displayedComments.length >= this.comments.allCount) {
//           this.loadCommentButton = false;
//         }
//       },
//       error: (errorResponse: HttpErrorResponse) => {
//         this.isIconDisabled = false;
//         if (errorResponse.error && errorResponse.error.message) {
//           this._snackBar.open(errorResponse.error.message);
//         }
//       }
//     });
//   }
//
//   processDate(date: string): string {
//     if (date) {
//       const components = date.split(' ')
//       const dateComponents = components[0].split('-',);
//       const year = dateComponents[0];
//       const month = dateComponents[1];
//
//       const days = dateComponents[2].split('T');
//       const day = days[0]
//
//       const times = days[1].split('.')
//       const time = times[0].split(':')
//
//       const hours = time[0]
//       const minutes = time[1]
//       return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
//     }
//     return ''
//   }
//
//   increaseCount(idComment: string) {
//     if (this.isIconDisabled) return;
//     this.isIconDisabled = true;
//     this.commentService.applyActionComment(idComment, IconState.Like).subscribe({
//       next: (data: DefaultResponseType | AddCommentType) => {
//         if ((data as DefaultResponseType).error) {
//           const error = (data as DefaultResponseType).message;
//           this._snackBar.open(error);
//           throw new Error(error);
//         } else {
//           this.commentService.getCommentActionsUser(idComment)
//             .subscribe(data => {
//               this.actionUser = data
//               const commentToUpdate = this.comments.comments.find(comment => comment.id === idComment);
//               // console.log(this.actionUser)
//               if (commentToUpdate) {
//                 if (this.iconState === IconState.Like && commentToUpdate.likesCount > 0) {
//                   commentToUpdate.likesCount--;
//                   this.iconState = IconState.Neutral;
//                 } else if (this.iconState === IconState.Dislike) {
//                   commentToUpdate.dislikesCount--;
//                   commentToUpdate.likesCount++;
//                   this.iconState = IconState.Like;
//                   this._snackBar.open('Ваш голос учтен');
//                 } else {
//                   commentToUpdate.likesCount++;
//                   localStorage.setItem(`likesCount_${idComment}`, commentToUpdate.likesCount.toString());
//                   this.iconState = IconState.Like;
//                   this._snackBar.open('Ваш голос учтен');
//                 }
//               }
//             })
//         }
//         this.isIconDisabled = false;
//       },
//       error: (errorResponse: HttpErrorResponse) => {
//         this.isIconDisabled = false;
//         if (errorResponse.error && errorResponse.error.message) {
//           this._snackBar.open(errorResponse.error.message);
//         }
//       }
//     });
//   }
//
//   decreaseCount(idComment: string): void {
//     if (this.isIconDisabled) return;
//     this.isIconDisabled = true;
//     this.commentService.applyActionComment(idComment, IconState.Dislike).subscribe({
//       next: (data: DefaultResponseType) => {
//         if ((data as DefaultResponseType).error) {
//           const error = (data as DefaultResponseType).message;
//           this._snackBar.open(error);
//           throw new Error(error);
//         } else {
//           this.commentService.getCommentActionsUser(idComment)
//             .subscribe(data => {
//               this.actionUser = data
//               const commentToUpdate = this.comments.comments.find(comment => comment.id === idComment);
//               if (commentToUpdate) {
//                 if (this.iconState === IconState.Dislike && commentToUpdate.dislikesCount > 0) {
//                   commentToUpdate.dislikesCount--;
//                   this.iconState = IconState.Neutral;
//                 } else if (this.iconState === IconState.Like) {
//                   commentToUpdate.likesCount--;
//                   commentToUpdate.dislikesCount++;
//                   this.iconState = IconState.Dislike;
//                 } else {
//                   commentToUpdate.dislikesCount++;
//                   this.iconState = IconState.Dislike;
//                   this._snackBar.open('Ваш голос учтен');
//                 }
//               }
//             })
//         }
//         this.isIconDisabled = false;
//       },
//       error: (errorResponse: HttpErrorResponse) => {
//         this.isIconDisabled = false;
//         if (errorResponse.error && errorResponse.error.message) {
//           this._snackBar.open(errorResponse.error.message);
//         }
//       }
//     });
//   }
//
//   violetRequest(idComment: string): void {
//     const violate = 'violate'
//     this.commentService.applyActionComment(idComment, violate)
//       .subscribe({
//         next: (data: DefaultResponseType | AddCommentType) => {
//           if ((data as DefaultResponseType).error) {
//             const error = (data as DefaultResponseType).message;
//             this._snackBar.open(error);
//             throw new Error(error);
//           } else {
//             this._snackBar.open('Жалоба отправлена');
//           }
//           this.isIconDisabled = false;
//         },
//         error: (errorResponse: HttpErrorResponse) => {
//           this.isIconDisabled = false;
//           if (errorResponse.error && errorResponse.error.message) {
//             this._snackBar.open('Жалоба уже отправлена');
//           }
//         }
//       });
//   }
//
//   reactionsWithComments(): void {
//     this.commentService.getAllCommentActions(this.detailArticle.id)
//       .subscribe((data: DefaultResponseType | CommentActionsType[]) => {
//         this.allActions = data as CommentActionsType[]
//         // this.allActions.forEach(action => {
//         //   action.forEach(action => {
//         //     this.comments.comments.forEach(comment => {
//         //       if (comment.id === action.comment) {
//         //         comment.action = action.action
//         //       }
//         //     })
//         //   })
//         //
//         // })
//
//       })
//   }
//
//   ngOnDestroy(): void {
//     this.commentPostSub?.unsubscribe()
//   }
// }
