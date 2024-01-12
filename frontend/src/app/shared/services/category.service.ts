import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {CategoryType} from "../../../types/category.type";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  constructor(private http: HttpClient) { }

    getCategories(): Observable<CategoryType[]> {
      return this.http.get<CategoryType[]>(environment.api + 'categories')
    }
}
