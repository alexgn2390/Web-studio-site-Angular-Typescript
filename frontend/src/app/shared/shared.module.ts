import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PasswordRepeatDirective} from "./directives/password-repeat.directive";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import { ArticleCardComponent } from './components/article-card/article-card.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

@NgModule({
  declarations: [PasswordRepeatDirective, ArticleCardComponent, PrivacyPolicyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  exports: [PasswordRepeatDirective, ArticleCardComponent, PrivacyPolicyComponent]
})
export class SharedModule { }
