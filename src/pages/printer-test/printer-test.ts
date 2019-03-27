import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { OcomServiceProvider } from '../../providers/ocom-service/ocom-service';
import { IKeyFunctionEvent } from 'ionic-native-ocom';
import { Subscription } from 'rxjs/Subscription';
import { PrintTsplServiceProvider } from '../../providers/print-tspl-service/print-tspl-service';
import { Work } from '../../providers/print-tspl-service/interfacesLabel';
import { InventoryDatabaseProvider, inventoryRow } from '../../providers/inventory-database/inventory-database';
import { Numeral, NumeralPipe } from 'ngx-numeral';
import { CsvService } from 'angular2-json2csv';

const defaultObj: inventoryRow = {
  OT: '',
  Material: '',
  Ancho: null,
  Calibre: null,
  Peso: null,
  Año: null,
  Mes: null,
  Tarima: null,
  Linea: null,
  Tipo: null
};
/**
 * Generated class for the PrinterTestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-printer-test',
  templateUrl: 'printer-test.html'
})
export class PrinterTestPage implements OnDestroy {
  constructor(
    public navCtrl: NavController,
    public printService: PrintTsplServiceProvider,
    public navParams: NavParams,
    private ocomService: OcomServiceProvider,
    private inventory: InventoryDatabaseProvider,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private csvService: CsvService
  ) {}
  counter = 1230;

  s$: Subscription;
  i$: Subscription;
  data: inventoryRow[] = [];
  toInsert: inventoryRow = Object.assign({}, defaultObj);
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth();
  line: string;
  pallet: number = 0;
  tipo: string = 'Materia Prima';
  page: string = 'List';
  selectOptions = { interface: 'popover' };

  ionViewDidLoad() {
    this.s$ = this.ocomService.keyFunctionPressed.subscribe((d: IKeyFunctionEvent) => {
      if (d.button === 'f1') {
        this.print();
      }
    });
    const ln = localStorage.getItem('line');
    const yr = localStorage.getItem('year');
    const mt = localStorage.getItem('month');
    const pl = localStorage.getItem('pallet');
    const tp = localStorage.getItem('tipo');

    this.line = ln == undefined ? 'df' : ln;
    this.month = mt == undefined ? new Date().getMonth() : parseInt(mt);
    this.year = yr == undefined ? new Date().getFullYear() : parseInt(yr);
    this.tipo = tp == undefined ? 'Materia Prima' : tp;
    this.pallet = pl == undefined ? 0 : parseInt(pl);

    this.i$ = this.inventory.getElements().subscribe(dt => {
      this.data = dt;
    });

    this.inventory
      .initialiceDB(this.year, this.month, this.line)
      .then(r => this.inventory.refreshData())
      .catch(e => console.log(e));
  }

  changeValDate(key: string, value: string) {
    localStorage.setItem(key, value);
    this.inventory.año = this.year;
    this.inventory.mes = this.month;
    this.inventory.linea = this.line;
    this.inventory.Tipo = this.tipo;
    this.inventory.refreshData();
  }
  saveOnly(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  ngOnDestroy() {
    this.i$.unsubscribe();
    this.s$.unsubscribe();
  }

  saveFile() {
    let monts = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
    this.csvService.download(this.data, `Inventario_${monts[this.month]}_${this.year}`);
    console.log(`saving file Inventario_${monts[this.month]}_${this.year}`);
  }

  async print() {
    try {
      this.toInsert.Año = this.year;
      this.toInsert.Mes = this.month;
      this.toInsert.Tarima = this.pallet;
      this.toInsert.Linea = this.line;
      this.toInsert.Tipo = this.tipo;

      this.toInsert.Ancho = this.toInsert.Ancho == null ? 0 : this.toInsert.Ancho;
      this.toInsert.Calibre = this.toInsert.Calibre == null ? 0 : this.toInsert.Calibre;
      this.toInsert.Material = this.toInsert.Material.trim() == '' ? 'sin especificar' : this.toInsert.Material;

      // let obj = { OT: 55478, PesoBruto: 14.85899992, PesoNeto: 14.0, PC: 0.86, FechaCaptura: new Date(), Tinta: 0.23 };

      this.inventory
        .insert(this.toInsert)
        .then(async res => {
          this.printJob(this.toInsert).then(() => {
            this.toInsert = Object.assign({}, defaultObj);
          });
        })
        .catch(rej => {
          const toast = this.toastCtrl.create({
            message: rej.message,
            duration: 3000
          });
          toast.present();
        });
    } catch (error) {
      console.log(error.message);
      const toast = this.toastCtrl.create({
        message: error.message,
        duration: 3000
      });
      toast.present();
    }
  }
  private async printJob(fr: inventoryRow) {
    let monts = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];

    let dataObj = Object.assign(
      { month: monts[fr.Mes], anio: fr.Año, date: new Date(), cId: new NumeralPipe(fr.Id).format('000000') },
      fr
    );

    let work: Work = {
      id: 1,
      height: 48,
      width: 80,
      unit: 'mm',
      name: 'Etiqueta de Prueba',
      labels: [
        {
          copies: 1,
          Texts: [
            { value: '@month@ @anio@', x: 20, y: 10, fontSize: 80, textOptions: { format: 'bold' } },
            { value: '@Peso,n:2.1-2@ Kg', x: 100, y: 80, fontSize: 100, textOptions: { format: 'bold' } },
            // { value: '@OT@', x: 400, y: 290, fontSize: 40 },
            { value: '@Material@ @Ancho,n:2.1-1@/@Calibre,n:1.0-0@', x: 30, y: 260, fontSize: 40 },
            { value: 'Tar: @Tarima@', x: 30, y: 300, fontSize: 70, textOptions: { format: 'bold' } },
            { value: '@Linea@ @OT@', x: 30, y: 175, fontSize: 60, textOptions: { format: 'bold' } },
            { value: '@Tipo@', x: 30, y: 225, fontSize: 35 },
            // { value: 'Peso Core: @PC,c:2.1-2', x: 20, y: 50, fontSize: 20 },
            // { value: 'Peso Neto: @PesoNeto,n:2.1-2', x: 20, y: 70, fontSize: 20 },
            { value: '@date,d:dd/MM/yyy_HH_mm@', x: 400, y: 330, fontSize: 20 }
            // {
            //   value: 'Tinta: @Tinta,p:2.0-2',
            //   x: 20,
            //   y: 150,
            //   fontSize: 60,
            //   textOptions: { fontName: 'Roboto', format: 'bold' }
            // }
          ],
          barcodes: [{ value: '@cId@', x: 350, y: 190, height: 45 }]
          //reverseZone: [{ x: 0, y: 0, width: 400, height: 400 }],
        }
      ]
    };
    this.printService.setDeviceMAC('DC:0D:30:73:05:17');
    await this.printService.buildFromWork(work, dataObj);
    console.log(this.printService.Code);
    this.printService.Print();
  }

  delete(Id: number) {
    let alert = this.alertCtrl.create({
      title: 'Confirmar Borrado',
      message: 'Realmente desea borrar el elemento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Si, Borrar',
          handler: () => {
            this.inventory.deleteElement(Id);
          }
        }
      ]
    });
    alert.present();
  }
  printExist(rw) {
    this.printJob(rw);
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
