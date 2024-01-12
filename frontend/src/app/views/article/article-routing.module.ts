import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BlogComponent} from "./blog/blog.component";
import {DetailArticleCardComponent} from "./detail-article-card/detail-article-card.component";

const routes: Routes = [
  {path: 'blog', component: BlogComponent},
  {path: 'articles/:url', component: DetailArticleCardComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticleRoutingModule { }
