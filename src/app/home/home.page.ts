import { Component, ViewChild, ElementRef } from '@angular/core';
import { ToastController, LoadingController, Platform } from '@ionic/angular';
import jsQR from 'jsqr';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';



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

  loading: HTMLIonLoadingElement = null;

  constructor(
    private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController,
    private plt: Platform,
    private router: Router,
    private auth: AuthService
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
      //console.log('code---->', code);

      if (code){
        this.scanActive =false;
        this.scanResult = code.data;
        this.showQrToast();
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

  reset(){
    this.scanResult = null;
    this.checkin = false;
    this.checkout = false;
    //console.log("--------reset scanning--------");
  }

  async showQrToast() {
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
    }/*
    const toast = await this.toastCtrl.create({
      message: `Open ${this.scanResult}?`,
      position: 'top',
      buttons: [
        {
          text: 'Open',
          handler: () => {
            window.open(this.scanResult, '_system', 'location=yes');
          }
        }
      ]
    });
    toast.present();*/
  }

  checkIn(){
    this.checkin = true;
    console.log('check in true');
  }

  checkOut(){
    this.checkout = true;
    console.log('check out true');
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
        this.showQrToast();
      } 
    };
    img.src = URL.createObjectURL(file);
  }

  logout(){
    console.log('button pressed');
    //this.router.navigate(['/login']);
    this.auth.logOut();
    console.log('supposed to go to login page');
  }
}
