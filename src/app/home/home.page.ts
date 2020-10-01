import { Component, ViewChild, ElementRef } from '@angular/core';
import { ToastController, LoadingController, Platform } from '@ionic/angular';
import jsQR from 'jsqr';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { ToastsService } from '../services/toasts.service';
import { UserBooking } from '../models/userBooking';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('video', { static:false }) video: ElementRef;
  @ViewChild('canvas', { static: false}) canvas: ElementRef;
  @ViewChild('fileinput', { static: false}) fileinput: ElementRef;

  videoElement: any;
  canvasElement: any;
  canvasContext: any;

  scanActive = false;
  scanResult = null;
  checkin = false;
  checkout = false;
  checkAvail = false;
  userBooking : UserBooking [] = [];

  loading: HTMLIonLoadingElement = null;

  constructor(
    private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController,
    private plt: Platform,
    private router: Router,
    private auth: AuthService,
    private api : ApiService, 
    private toast : ToastsService
    ) {
      const isInStandaloneMode = () =>
      'standalone' in window.navigator && window.navigator['standalone'];
      if (this.plt.is('ios') && isInStandaloneMode()) {
        console.log('I am a an iOS PWA!');
      }
    }

  ngAfterViewInit() {
    // initialize
    this.videoElement = this.video.nativeElement;
    this.canvasElement = this.canvas.nativeElement;
    this.canvasContext = this.canvasElement.getContext('2d');
  }

  async startScan(){
    //ios
    //console.log("--------start scanning--------");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment'}
    });
    this.videoElement.srcObject = stream;
    //safari
    this.videoElement.setAttribute('playsinline', true);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.videoElement.play();
    requestAnimationFrame(this.scan.bind(this));
    
    //console.log("--------requestedFrame--------");
  }

  async scan(){
    //console.log('SCAN---------');
    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA)
    {
      if (this.loading){
        await this.loading.dismiss();
        this.loading = null;
        this.scanActive = true;
      }
      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;
      //canvas
      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    //console.log("--------canvas drawn--------");
      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    //console.log("--------image drawn--------");
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        //inversionAttempts: 'dontInvert'
      });
     // console.log('code---->', code);
      if (code){
        this.scanActive =false;
        this.scanResult = code.data;
        
        var str = this.scanResult;
        var sliced  = +str.slice(7,-2);
       // var id = Integer.parseInt(this.scanResult.get("id"));
        //var id = code.get("id").asInt();
        //$scope.number = parseInt(this.scanResult);
        // var num=Number (this.scanResult); 
        //Returning : Integer?
       // var v1 = parseInt(this.scanResult);
        
        if(this.checkin==true){
         this.checkIn({tableId:sliced}); 
          //this.checkIn(this.scanResult); 
        }else if(this.checkout==true){
          this.checkOut({tableId:sliced}); 
          //this.checkOut(this.scanResult); 
        }else if(this.checkAvail==true){
          this.checkAvailability({tableId:sliced}); 
          //this.checkAvailability(this.scanResult); 
        }


      } else {
        if (this.scanActive)
        {
          requestAnimationFrame(this.scan.bind(this));
        }
      }
    } else {
      requestAnimationFrame(this.scan.bind(this));
    }
  }

  stopScan(){
    this.scanActive = false;
    //console.log("--------stop scanning--------");
  }


  async showQrToast() {
    /*
    if (this.checkin==true){
      const toast = await this.toastCtrl.create({
        message: `Checked in`,
        position: 'top',
        duration: 3000,
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      toast.present();
    }
    else if(this.checkout==true){
      const toast = await this.toastCtrl.create({
        message: `Checked out`,
        position: 'top',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      toast.present();
    }
    else if(this.checkAvail==true){
      const toast = await this.toastCtrl.create({
        message: `Available for check in, click check in.`,
        position: 'top',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      toast.present();
      
    }*/
  }
  /////UserBooking/////////////////////////////////////////

  checkAvailability(tableId: any){
    this.api.checkAvailability(tableId).subscribe( suc => this.checkSuccess(suc), err => this.checkFail(err));
  }
  async checkSuccess(suc){
    //this.toast.display({type:"Success", heading : suc.Title, message : suc.message});

    const toast = await this.toastCtrl.create({
      message: suc.message, position: 'top', buttons: [
        { text: 'Close', role: 'cancel', handler: () => {} }
      ]
    });
    toast.present();

    this.checkAvail = false;
  }

  async checkFail(err){
    //this.toast.display({type:"Error", heading : err.error.Title, message : err.error.message});

    const toast = await this.toastCtrl.create({
      message: err.error.message, position: 'top', buttons: [
        { text: 'Close', role: 'cancel', handler: () => {}}
      ]
    });
    toast.present();

    this.checkAvail = false;
  }

  checkIn(tableId: any){
    this.api.checkIn(tableId).subscribe( suc => this.checkInSuccess(suc), err => this.checkInFail(err));
  }
 async checkInSuccess(success){
    this.toast.display({type:"Success", heading : success.Title, message : success.message});
    const toast = await this.toastCtrl.create({
      message: success.message, position: 'top', buttons: [
        { text: 'Close', role: 'cancel', handler: () => {} }
      ]
    });
    toast.present();

    //this.showQrToast();
    this.checkin = false;
  }
  
  async checkInFail(err){
    this.toast.display({type:"Error", heading : err.error.Title, message : err.error.message});
    const toast = await this.toastCtrl.create({
      message: err.error.message, position: 'top', buttons: [
        { text: 'Close', role: 'cancel', handler: () => {}}
      ]
    });
    toast.present();
    this.checkin = false;
  }

  checkOut(tableId: any){
    this.api.checkOut(tableId).subscribe( suc => this.checkOutSuccess(suc), error => this.checkOutFail(error));
  }
 async checkOutSuccess(success){
    this.toast.display({type:"Success", heading : success.Title, message : success.message});
    const toast = await this.toastCtrl.create({
      message: success.message, position: 'top', buttons: [
        { text: 'Close', role: 'cancel', handler: () => {} }
      ]
    });
    toast.present();
    this.checkout = false;
  }
  
  async checkOutFail(error){
    this.toast.display({type:"Error", heading : error.error.Title, message : error.error.message});
    const toast = await this.toastCtrl.create({
      message: error.error.message, position: 'top', buttons: [
        { text: 'Close', role: 'cancel', handler: () => {}}
      ]
    });
    toast.present();
    this.checkout = false;
  }

  getUserBooking(){
    return this.api.getUserBooking().subscribe( success => this.getUserBookingSuccess(success), error => this.getUserBookingFail(error));
  }
   //fail
   getUserBookingFail(error){
    this.toast.display({type : "Error", heading :error.error.Title, message : error.error.message });
  }
  //success
  getUserBookingSuccess(userBooking: UserBooking[]){
    //console.log(userBooking);
    this.userBooking = userBooking;
  }




  // getting qr code from a image you upload
  captureImage(){
    this.fileinput.nativeElement.click();
  }

  handleFile(files:FileList){
    const file = files.item(0);

    var img = new Image();
    img.onload = () => {
      this.canvasContext.drawImage(img, 0, 0, this.canvasElement.width, this.canvasElement.height);
      const imageData = this.canvasContext.getImageData(
        0, 
        0, 
        this.canvasElement.width, 
        this.canvasElement.height
      );
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts:'dontInvert'
      });
      //result
      console.log(code);

      if (code) {
        this.scanResult = code.data;
        //this.showQrToast();
      } 
    };
    img.src = URL.createObjectURL(file);
  }

  logout(){
    this.auth.logOut();
  }


  checkAvailClick(){
    this.checkAvail = true;
  }
  checkInClick(){
    this.checkin = true;
    
  }
  checkOutClick(){
    this.checkout = true;
  }


}
