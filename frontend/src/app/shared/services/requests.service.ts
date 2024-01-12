import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {RequestsType} from "../../../types/requests.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})

export class RequestsService {
  constructor(private http: HttpClient) {}

  postRequestOrder(name: string, phone: string, service: string, type: string): Observable<RequestsType | DefaultResponseType> {
    return this.http.post<RequestsType | DefaultResponseType>(environment.api + 'requests', {
      name, phone, service, type
    })
  }

  postRequestConsultation(name: string, phone: string, type: string): Observable<RequestsType | DefaultResponseType> {
    return this.http.post<RequestsType | DefaultResponseType>(environment.api + 'requests', {
      name, phone, type
    })
  }
}
