import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ArticlesService} from "../../shared/services/articles.service";
import {ArticleType} from "../../../types/article.type";
import {environment} from "../../../environments/environment";
import {FormBuilder, Validators} from "@angular/forms";
import {RequestsType} from "../../../types/requests.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {RequestsService} from "../../shared/services/requests.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  popularArticles: ArticleType[] = []
  serverStaticPath = environment.serverStaticPath
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: true,
    pullDrag: true,
    margin: 24,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
    },
    nav: false
  }
  customOptionsReviews: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 24,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
    },
    nav: false
  }

  serviceUpForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
  })

  selectedOption: string = ''
  isClose: boolean = true
  openModal!: boolean
  openModalApp: boolean = false
  type: string = 'order'
  errorResponse: boolean = false


  constructor(private articlesService: ArticlesService,
              private fb: FormBuilder,
              private requests: RequestsService,
              private router: Router,
              private _snackBar: MatSnackBar,) {}

  ngOnInit(): void {
    this.articlesService.getPopularArticles()
      .subscribe((data: ArticleType[]) => {
        this.popularArticles = data
        // console.log(data)
      })
  }

  get name() {
    return this.serviceUpForm.get('name')
  }
  get phone() {
    return this.serviceUpForm.get('phone')
  }

  serviceOpenModal(option: string): void {
    this.selectedOption = option
    this.openModal = true
  }

  serviceCloseModal(): void {
    this.openModal = false
  }

  openDropdownList(): void {
    this.isClose = !this.isClose
  }

  serviceClickFieldClose(option: string): void {
    this.selectedOption = option
    this.isClose = !this.isClose
  }

  serviceFormSubmit(): void {
    if (this.serviceUpForm.valid && this.serviceUpForm.value.name && this.serviceUpForm.value.phone && this.selectedOption) {
      this.requests.postRequestOrder(this.serviceUpForm.value.name, this.serviceUpForm.value.phone, this.selectedOption, this.type)
        .subscribe({
          next: (data: RequestsType | DefaultResponseType) => {
            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message
            }
            if (error) {
              this.openModalApp = true
              this.openModal = false
            }
            this.router.navigate(['/'])
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.errorResponse = true
          }
        })
    } else {
      this._snackBar.open('Заполните форму!');
    }
  }

  serviceCloseModalApp(): void {
    this.openModalApp = false
  }
}
