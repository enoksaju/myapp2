import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { OcomServiceProvider } from '../../providers/ocom-service/ocom-service';
import { PrintTsplServiceProvider } from '../../providers/print-tspl-service/print-tspl-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit, OnDestroy {
  private subscription: Subscription;
  code: string;

  TSPL: string = 'SIZE 40 mm, 30 mm\r\nCLS\r\nQRCODE 200,150,M,7,A,0,J1,M1,S7,"Hola Mundo"\r\nPRINT 1\r\n';
  constructor(public navCtrl: NavController, private ngZone: NgZone, private ocomService: OcomServiceProvider, private printP: PrintTsplServiceProvider) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  printCode() {
    this.printP.setDeviceMAC('DC:0D:30:73:05:17');
    this.printP.Print(1, this.TSPL);
  }

  ngOnInit(): void {

  }

  ionViewDidLoad() {
    this.subscription = this.ocomService.barcodeReaded.subscribe(t => {
      this.ngZone.run(() => {
        this.code = t;
        console.log(this.code);
      });
    });
  }
}
