import {Component, HostListener, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleType} from "../../../../types/article.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryType} from "../../../../types/category.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {ActiveParamsUtil} from "../../../shared/utils/active-params-utils";
import {AppliedFilterType} from "../../../../types/applied-filter.type";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})

export class BlogComponent implements OnInit {
  articles: ArticleType[] = []
  categories: CategoryType[] = []
  appliedFilters: AppliedFilterType[] = [];
  activeParams: ActiveParamsType = {categories: []}
  pages: number[] = []
  sortingOpen = false;
  activeCategory: string | boolean = '';
  categoryState: { [url: string]: boolean } = {};
  categoryData: { [key: string]: AppliedFilterType } = {};
  arrow: boolean = false

  constructor(private articlesService: ArticlesService,
              private categoryService: CategoryService,
              private router: Router,
              private activatedRoute: ActivatedRoute,) {}

  ngOnInit(): void {
    this.categoryService.getCategories()
      .subscribe(data => {
        this.categories = data
        console.log(this.categories)
        this.activatedRoute.queryParams
          .pipe(
            debounceTime(500)
          )
          .subscribe(params => {
          // console.log(params)
          this.activeParams = ActiveParamsUtil.processParams(params)
          this.activeParams.categories.forEach((url) => {
            this.categoryState[url] = true;
          });
          this.appliedFilters = []
          this.activeParams.categories.forEach(url => {
            for (let i = 0; i < this.categories.length; i++) {
              const foundCategory = this.categories.find(category => category.url === url)
              if (foundCategory) {
                if (!this.categoryData[url]) {
                  this.categoryData[url] = {
                    name: foundCategory.name,
                    urlParam: foundCategory.url
                  };
                }
              }
            }
            this.appliedFilters.push(this.categoryData[url])
          })
          this.articlesService.getArticleCategory(this.activeParams)
            .subscribe(data => {
              this.articles = data.items
              console.log(this.articles)
              this.pages = [];
              for (let i = 1; i <= data.pages; i++) {
                 this.pages.push(i)
              }
            })
            if (!this.activeParams.page) {
              // Если параметр 'page' не установлен, устанавливаем его на 2
              this.activeParams.page = 1;
              this.router.navigate(['/blog'], {
                queryParams: this.activeParams,
              });
            }
        })
      })
  }

  updateFilterParam(url: string): void {
    this.categoryState[url] = !this.categoryState[url];
    this.activeParams.categories = Object.keys(this.categoryState).filter((categoryUrl) => this.categoryState[categoryUrl]);
    this.activeParams.page = 1;
    this.router.navigate(['/blog'], {
      queryParams: {categories: this.activeParams.categories},
    });
  }

  toogleSorting():void {
    this.sortingOpen = true
    this.arrow =  true
  }

  openPage(page: number): void {
    this.activeParams.page = page;
    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  openPrevPage(): void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--
      this.router.navigate(['/blog'], {
        queryParams: this.activeParams
      });
    }
  }

  openNextPage(): void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++
      this.router.navigate(['/blog'], {
        queryParams: this.activeParams
      });
    }
  }

  removeAppliedFilter(appliedFilters: AppliedFilterType): void {
    delete this.categoryState[appliedFilters.urlParam] ;
    this.activeParams.categories = Object.keys(this.categoryState);
    this.activeParams.page = 1;
    // Генерируем URL с обновленными параметрами
    this.router.navigate(['/blog'], {
      queryParams: { categories: this.activeParams.categories },
    });
  }

  @HostListener('document: click', ['$event'])
  click(event: Event) {
    if (this.sortingOpen && event  && event.target as HTMLElement) {
     const targetClassName = (event.target as HTMLElement).className;
     if (targetClassName && targetClassName.indexOf && targetClassName.indexOf('blog-sorting-item') === -1
     && targetClassName.indexOf('blog-sorting-item-category') === -1) {
       this.sortingOpen = false
       this.arrow =  false
     }
    }
  }
}

