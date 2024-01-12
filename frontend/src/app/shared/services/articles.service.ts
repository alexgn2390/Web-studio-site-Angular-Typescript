import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ArticleType} from "../../../types/article.type";
import {Observable} from "rxjs";
import {ActiveParamsType} from "../../../types/active-params.type";
import {DetailArticleType} from "../../../types/detail-article.type";
import {DefaultResponseType} from "../../../types/default-response.type";


@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  constructor(private http: HttpClient) {}

  getPopularArticles(): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/top')
  }

  getArticles(params: ActiveParamsType): Observable<{count: number, pages: number, items: ArticleType[]}> {
    return this.http.get<{count: number, pages: number, items: ArticleType[]}>(environment.api + 'articles', {
      params: params
    })
  }

  getArticleCategory(params: ActiveParamsType): Observable<{count: number, pages: number, items: ArticleType[]}> {
    return this.http.get<{count: number, pages: number, items: ArticleType[]}>(environment.api + 'articles?page=' + params.page + '&categories=' + params.categories, {
      params: params
    })
  }

  getDetailArticle(url: string): Observable<DetailArticleType | DefaultResponseType> {
    return this.http.get<DetailArticleType | DefaultResponseType>(environment.api + 'articles/' + url)
  }

  getDetailArticleRelated(url: string): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/related/' + url)
  }
}
