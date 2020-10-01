import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Country } from '../models/country';
//import { Nationality } from '../models/Nationality';
import { ToastsService } from './toasts.service';
import { UserBooking } from '../models/userBooking';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  /*****************URLS********************/
  globalRoot :string = 'http://bmwbackend.edumarx.co.za/'
  user : string = `${this.globalRoot}API/User/`;
  country : string = `${this.globalRoot}API/Country/`;
  nationality : string = `${this.globalRoot}API/Nationality/`;
  userBooking : string = `${this.globalRoot}API/UserBooking/`;

  
  constructor( private http: HttpClient){ 

  }
  makeRequest(){
    
    this.http.post<string>(this.country,{"request":"test","payload":0},{headers:{'Authorization':'Bearer '+'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIyNjUyLCJyb2xlcyI6W3siaWQiOjAsInJvbGUiOiJNYW5hZ2VyIn0seyJpZCI6MSwicm9sZSI6IkVtcGxveWVlIn1dLCJ2aWV3cyI6W3siaWQiOjAsInZpZXciOiJSZXBvcnQifSx7ImlkIjoxLCJyb2xlIjoiQm9va2luZyJ9XSwiZW5kU2Vzc2lvbiI6MTU5NjUzOTgzMX0.76phXVqFCK60VdOrtAEhGne-09MdRHie3kJnUbBgmbw'}})
    .subscribe( success => console.log(success),
    error => console.log("ERROR",error));
  }

  getCountries(){
    //return this.http.post<Country[]>(this.country,{"request":"getCountries"});
  }

  getNationalities(){
    //return this.http.post<Nationality[]>(this.nationality,{"request":"getNationalities"});
  }

  createAccount(userDetails:any){
    console.log(userDetails);
    return this.http.post(this.user,{"request":"createAccount","payload": userDetails});
  }
   //////UserBooking////////////////////////
  
  getUserBooking(){
    return this.http.post<UserBooking[]>(this.userBooking, {request: 'getUserBooking'});
  }
  

  checkAvailability(tableId: any){
    return this.http.post<UserBooking[]>(this.userBooking, {request: 'checkAvailability', payload: tableId });
  }

  checkIn(tableId: any){
    return this.http.post<UserBooking[]>(this.userBooking, {request: 'checkIn', payload: tableId });
  }

  checkOut(tableId: any){
    return this.http.post<UserBooking[]>(this.userBooking, {request: 'checkOut', payload: tableId });
  }

  
}