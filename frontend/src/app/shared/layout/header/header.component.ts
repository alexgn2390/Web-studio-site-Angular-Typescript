import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {UserInfoService} from "../../services/user-info.service";
import {UserInfoType} from "../../../../types/user-info.type";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLogged: boolean = false
  userInfo!: UserInfoType | null;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute,
              private userInfoService: UserInfoService,) {
    this.isLogged = this.authService.getIsLoggedIn()
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.userInfoService.getUserInfo().subscribe((user: UserInfoType | DefaultResponseType) => {
        this.userInfo = user as UserInfoType
        // console.log(this.userInfo)
      })
      this.isLogged = isLoggedIn
    })
    if (this.isLogged) {
    this.userInfoService.getUserInfo().subscribe((user: UserInfoType | DefaultResponseType) => {
        this.userInfo = user as UserInfoType
        // console.log(this.userInfo)
    })
    }
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (data: DefaultResponseType) => {
          this.doLogout()
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.doLogout()
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens()
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }
}
