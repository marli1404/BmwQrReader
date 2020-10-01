import { Injectable } from '@angular/core';
//import { View } from '../models/view';
import * as jwt_decode from 'jwt-decode';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { ToastsService } from './toasts.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userId : number;
  //userViews : View [] = [];
  loggedIn : boolean = false;
  sessionExpiry$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  constructor( private http : HttpClient, private toasts: ToastsService,private router : Router) { 
   
    // this.sessionExpiry$.subscribe( expiry =>{
    //   if(expiry == true)
    //     this.logOut();
    //     this.toasts.display({type:"Error", heading: "Token Expired",message:"Please log in again"});
    //     this.router.navigate(["/login"]);
    // });
  }


  getUserId(){
    const token = localStorage.getItem("bmwToken");
    if(!token){
      this.logOut();
      return null;
    }
    else {
      return jwt_decode(token).userId;
    }
  }

  logIn( details : any){
    return this.http.post("http://bmwbackend.edumarx.co.za/API/User",
    JSON.stringify({request:"logIn",payload:details}))
    .pipe(
      tap( token => this.setLogin(token))
    );
  }
  
  setLogin(token){
      console.log(token);
      let uncompress = jwt_decode(token);
      const expiry = new Date(uncompress.endSession);
      let difference = expiry.getTime() - new Date().getTime();
      
      if(difference < 0){
        this.toasts.display({type:"Error", heading: "Invalid Token",message:"The token retrieved from the server is out of date"});
        this.router.navigate(["/login"]);
        return;
      }
      else{
        //SETTING WHAT USER MAY VIEW
        /*this.userViews = uncompress.views.map( x => { 
          let view = new View
          view.view = x.name
          view.id = x.id
          return view;
        });*/
        //SETTING USER ID
        this.userId = uncompress.userId;
        localStorage.setItem('bmwToken',token);
        localStorage.setItem('bmwSessionEnd',expiry.toString());
        this.loggedIn = true;
        this.sessionExpiry$.next(false);
      }
      
  }

  logOut(){
      localStorage.removeItem("bmwToken");
      localStorage.removeItem("bmwSessionEnd");
      this.router.navigate([""]);
      this.sessionExpiry$.next(true);
  }

  isLoggedIn(){

    if( localStorage.getItem("bmwToken"))
    {
      let expiry = new Date( localStorage.getItem("bmwSessionEnd"));
      let currentTime = new Date();
      if(expiry.getTime() - new Date().getTime() < 0)
        return false;

        return true;
    }
    return false;

  }

  //dont need this
  /*
  getViews(){

    let token = jwt_decode(localStorage.getItem("bmwToken"));
    
    let tokenViews = token.views;
    this.userViews = tokenViews.map( x => { 
      let view = new View
      view.view = x.name
      view.id = x.id
      return view;
    });
    return this.userViews;

  }*/
}