import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Broadcaster } from '@ionic-native/broadcaster';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Ocom } from 'ionic-native-ocom';
import { PrinterTestPageModule } from '../pages/printer-test/printer-test.module';
import { OcomServiceProvider } from '../providers/ocom-service/ocom-service';
import { PrintTsplServiceProvider } from '../providers/print-tspl-service/print-tspl-service';
import { DatePipe, DecimalPipe, CurrencyPipe, PercentPipe } from '@angular/common';

@NgModule({
  declarations: [MyApp, HomePage, ListPage],
  imports: [HttpModule, BrowserModule, PrinterTestPageModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage, ListPage],
  providers: [StatusBar, Broadcaster, SplashScreen, Ocom, DatePipe, DecimalPipe, CurrencyPipe, PercentPipe, { provide: ErrorHandler, useClass: IonicErrorHandler }, OcomServiceProvider, PrintTsplServiceProvider],
})
export class AppModule {}
