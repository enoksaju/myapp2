import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrinterTestPage } from './printer-test';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

@NgModule({
  declarations: [PrinterTestPage],
  providers: [BluetoothSerial],
  imports: [IonicPageModule.forChild(PrinterTestPage)],
})
export class PrinterTestPageModule {}
