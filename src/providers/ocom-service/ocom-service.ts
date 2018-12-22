import { Injectable, EventEmitter } from '@angular/core';
import { Ocom, IKeyFunctionEvent, ICodeBarData } from 'ionic-native-ocom';

/*
  Generated class for the OcomServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class OcomServiceProvider {
  barcodeReaded: EventEmitter<string> = new EventEmitter();
  keyFunctionPressed: EventEmitter<IKeyFunctionEvent> = new EventEmitter();

  constructor(private ocom: Ocom) {
    setTimeout(() => {
      this.ocom.start('scan, scan_right');
      this.ocom.addOneDScanListener().subscribe(data => {
        this.onBarCodeReaded(data);
      });
      this.ocom.addKeyFPressedListener().subscribe(data => {
        this.onKeyFunctionPressed(data);
      });
    }, 2000);
  }

  private onKeyFunctionPressed(event: IKeyFunctionEvent) {
    this.keyFunctionPressed.emit(event);
  }

  private onBarCodeReaded(value: ICodeBarData) {
    this.barcodeReaded.emit(value.data);
  }
}
