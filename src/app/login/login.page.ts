import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HomePage } from '../home/home.page';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, Validators, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    public toastCtrl: ToastController,
    private auth: AuthService,
    private builder: FormBuilder
  ) {}

  loginDetails: FormGroup;

  emailInvalid = false;
  displayError : any;

  ngOnInit() {
    //console.log('NgOnInit Login');
    this.buildForm();
    this.emailInvalid = false;
  }

  ngOnDestroy(){
    //console.log("ngon destroy");
  }

  buildForm(){
    this.loginDetails = this.builder.group({
      'email':['',Validators.required,  Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9._]+\.[a-z]{2,4}$")  ],
      'password':['',Validators.required]
    });
  }
  getFormValues(){
    return {
      email: this.loginDetails.get('email').value,
      password: this.loginDetails.get('password').value
    }
  }

  login(){
    this.auth.logIn(this.getFormValues()).subscribe(success => this.logInSuccess(),
     error => this.loginFailed(error));
  }

  logInSuccess(){
    if(this.auth.isLoggedIn)
      this.router.navigate(['/home']);
      this.loginDetails.reset();
  }

  loginFailed(error: any){
    this.emailInvalid = true;
    this.displayError = error.error.message;
    this.loginDetails.reset();
  }

  get email(){
    return this.loginDetails.get('email');
  }

  get password(){
    return this.loginDetails.get('password');
  }
}
