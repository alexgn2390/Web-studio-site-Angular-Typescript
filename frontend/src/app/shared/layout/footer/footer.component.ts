import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {RequestsService} from "../../services/requests.service";
import {RequestsType} from "../../../../types/requests.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit{
  callInForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
  })
  type: string = 'consultation'
  openModal: boolean = false
  openModalApp: boolean = false
  errorResponse: boolean = false

  constructor( private fb: FormBuilder,
               private requests: RequestsService,
               private _snackBar: MatSnackBar,
               private router: Router) {}

  ngOnInit(): void {}

  get name() {
    return this.callInForm.get('name')
  }

  get phone() {
    return this.callInForm.get('phone')
  }

  callInOpenModal() {
    this.openModal = true
  }

  callInCloseModal() {
    this.openModal = false
  }

  callInFormSubmit() {
    if (this.callInForm.valid && this.callInForm.value.name && this.callInForm.value.phone) {
      this.requests.postRequestConsultation(this.callInForm.value.name, this.callInForm.value.phone, this.type)
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

  callInCloseModalApp() {
    this.openModalApp = false
  }
}
