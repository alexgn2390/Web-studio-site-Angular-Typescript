import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArticleRoutingModule} from './article-routing.module';
import {BlogComponent} from "./blog/blog.component";
import {SharedModule} from "../../shared/shared.module";
import {DetailArticleCardComponent} from './detail-article-card/detail-article-card.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [BlogComponent, DetailArticleCardComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    ArticleRoutingModule,

  ]
})
export class ArticleModule {
}
