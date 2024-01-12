import { Injectable } from '@angular/core';
import {Observable, throwError} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {UserInfoType} from "../../../types/user-info.type";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})

export class UserInfoService {
  constructor(private http: HttpClient,
              private authService: AuthService,) { }

  getUserInfo():Observable<UserInfoType | DefaultResponseType> {
    const tokens = this.authService.getTokens()
    if (tokens && tokens.accessToken) {
      const headers = new HttpHeaders({
        'x-auth': tokens.accessToken,
      });
      return this.http.get<UserInfoType | DefaultResponseType>(environment.api + 'users', {
        headers
      })
    }
    return throwError(() => 'Can not use token')
  }
}
