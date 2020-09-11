import { Injectable, TemplateRef,  } from '@angular/core';
import { Toast } from '../models/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastsService {

  toasts : Toast [] = [];

  constructor() { }

  ngOnInit(){

  }

  display( newToast : Toast){
    this.toasts.push(newToast);
  }

  remove(toast){
    this.toasts = this.toasts.filter( x => x != toast);
  }
}