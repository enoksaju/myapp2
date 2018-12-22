import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, DateTime } from 'ionic-angular';

import { OcomServiceProvider } from '../../providers/ocom-service/ocom-service';
import { IKeyFunctionEvent } from 'ionic-native-ocom';
import { Subscription } from 'rxjs/Subscription';
import { PrintTsplServiceProvider } from '../../providers/print-tspl-service/print-tspl-service';
import { Work } from '../../providers/print-tspl-service/interfacesLabel';

/**
 * Generated class for the PrinterTestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-printer-test',
  templateUrl: 'printer-test.html',
})
export class PrinterTestPage implements OnDestroy {
  constructor(public navCtrl: NavController, public printService: PrintTsplServiceProvider, public navParams: NavParams, private ocomService: OcomServiceProvider) {}
  counter = 1230;

  s$: Subscription;

  ionViewDidLoad() {
    this.s$ = this.ocomService.keyFunctionPressed.subscribe((d: IKeyFunctionEvent) => {
      if (d.button === 'f1') {
        this.print();
      }
    });
  }

  ngOnDestroy() {
    this.s$.unsubscribe();
  }

  async print() {
    let obj = { OT: 55478, PesoBruto: 14.85899992, PesoNeto: 14.0, PC: 0.86, FechaCaptura: new Date(), Tinta: 0.23 };

    let work: Work = {
      id: 1,
      height: 30,
      width: 40,
      unit: 'mm',
      name: 'Etiqueta de Prueba',
      labels: [
        {
          copies: 1,
          Texts: [
            { value: 'OT: @OT', x: 20, y: 10, fontSize: 20 },
            { value: 'PB: @PesoBruto,n:', x: 20, y: 30, fontSize: 20 },
            { value: 'Peso Core: @PC,c:2.1-2', x: 20, y: 50, fontSize: 20 },
            { value: 'Peso Neto: @PesoNeto,n:2.1-2', x: 20, y: 70, fontSize: 20 },
            { value: 'Fecha: @FechaCaptura,d:dd/MM/yyy_HH_mm', x: 20, y: 100, fontSize: 20 },
            { value: 'Tinta: @Tinta,p:2.0-2', x: 20, y: 150, fontSize: 60, textOptions: { fontName: 'Roboto', format: 'bold' } },
          ],
          reverseZone: [{ x: 0, y: 0, width: 400, height: 400 }],
        },
      ],
    };

    this.printService.setDeviceMAC('DC:0D:30:73:05:17');
    // await this.printService.initLabel(40, 30, 'mm');
    // // await this.printService.drawBar({ x: 0, y: 0, width: 400, height: 400 });

    // await this.printService.drawTextG({ value: 'OT: @OT', x: 20, y: 10, fontSize: 20 }, obj);
    // await this.printService.drawTextG({ value: 'PB: @PesoBruto,n:', x: 20, y: 30, fontSize: 20 }, obj);
    // await this.printService.drawTextG({ value: 'Peso Core: @PC,c:2.1-2', x: 20, y: 50, fontSize: 20 }, obj);
    // await this.printService.drawTextG({ value: 'Peso Neto: @PesoNeto,n:2.1-2', x: 20, y: 70, fontSize: 20 }, obj);
    // await this.printService.drawTextG({ value: 'Fecha: @FechaCaptura,d:dd/MM/yyy_HH_mm', x: 20, y: 100, fontSize: 20 }, obj);
    // await this.printService.drawTextG({ value: 'Tinta: @Tinta,p:2.0-2', x: 20, y: 150, fontSize: 60, textOptions: { fontName: 'Roboto', format: 'bold' } }, obj);
    // await this.printService.drawReverseZone({ x: 0, y: 0, width: 400, height: 400 });
    // await this.printService.endPageLabel(1, true);

    await this.printService.buildFromWork(work, obj);
    console.log(this.printService.Code);
    this.printService.Print();
  }

  hex_to_ascii(str1: string) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  }
}
