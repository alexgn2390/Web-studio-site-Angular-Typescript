import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DefaultResponseType} from "../../../types/default-response.type";
import {AddCommentType} from "../../../types/add-comment.type";
import {environment} from "../../../environments/environment";
import {Observable, of} from "rxjs";
import {AuthService} from "./auth.service";
import {GetCommentsType} from "../../../types/get-comments.type";
import {CommentActionsType} from "../../../types/comment-actions.type";

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private http: HttpClient,
              private authService: AuthService,) {}

  addComments(text: string, article: string): Observable<DefaultResponseType | AddCommentType> {
    const tokens = this.authService.getTokens()
    if (tokens && tokens.accessToken) {
      const headers = new HttpHeaders({
        'x-auth': tokens.accessToken,
      });
      return this.http.post<DefaultResponseType | AddCommentType>(environment.api + 'comments', {
        text, article
      }, {headers})
    }
    return of()
  }

  getComments(offset: number, article: string): Observable<DefaultResponseType | GetCommentsType> {
      return this.http.get<DefaultResponseType | GetCommentsType>(environment.api + 'comments?offset=' + offset + '&article=' + article)
  }

  applyActionComment(idComment: string, action: string) {
    const tokens = this.authService.getTokens()
    if (tokens && tokens.accessToken) {
      const headers = new HttpHeaders({
        'x-auth': tokens.accessToken,
      });
      return this.http.post<DefaultResponseType>(environment.api + 'comments/' + idComment + '/apply-action', {action}, {
        headers
      })
    }
    return of()
  }

  getAllCommentActions(articleId: string): Observable<DefaultResponseType | CommentActionsType[]> {
    const tokens = this.authService.getTokens()
    if (tokens && tokens.accessToken) {
      const headers = new HttpHeaders({
        'x-auth': tokens.accessToken,
      });
      return this.http.get<DefaultResponseType | CommentActionsType[]>(environment.api + 'comments/article-comment-actions?articleId=' + articleId, {
        headers
      })
    }
    return of()
  }

  getCommentActionsUser(commentId: string): Observable< CommentActionsType[]> {
    const tokens = this.authService.getTokens()
    if (tokens && tokens.accessToken) {
      const headers = new HttpHeaders({
        'x-auth': tokens.accessToken,
      });
      return this.http.get<CommentActionsType[]>(environment.api + 'comments/' +  commentId +'/actions' , {
        headers
      })
    }
    return of()
  }
}
