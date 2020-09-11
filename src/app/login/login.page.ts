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

 // email: string;
 // password: string;
 

  constructor(
    private router: Router,
    public toastCtrl: ToastController,
    private auth: AuthService,
    private builder: FormBuilder
  ) {}

  loginDetails: any;

  ngOnInit() {
    console.log('NgOnInit Login');
    this.buildForm();
  }

  ngOnDestroy(){
    console.log("ngon destroy");
  }

  buildForm(){
    this.loginDetails = this.builder.group({
      'email':['',Validators.required,  Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9._]+\.[a-z]{2,4}$")  ],
      'password':['',Validators.required,  Validators.pattern("(?=^.{8,15}$)(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?!.*\s)-_.*$"), Validators.minLength(8)]
    });
  }
  getFormValues(){
    return {
      email: this.loginDetails.get('email').value,
      password: this.loginDetails.get('password').value
    }
  }

  async login(){
    //console.log('email:'+ this.email);
    //console.log('password:'+ this.password);
    
    //console.log('button pressed');
    //this.router.navigate(['/home']);
    //console.log('supposed to go to home');
    
    //jono login stuff

    this.auth.logIn(this.getFormValues()).subscribe(success => this.logInSuccess(),
     error => this.loginFailed(error));
  }

  logInSuccess(){
    if(this.auth.isLoggedIn)
      this.router.navigate(['/home']);
  }

  loginFailed(error: any){
    console.log(error);
  }

  get email(){
    return this.loginDetails.get('email');
  }

  /*get password(){
    return this.loginDetails.get('password');
  }*/

  get password(){

    return this.loginDetails.get('password');
  }


}
