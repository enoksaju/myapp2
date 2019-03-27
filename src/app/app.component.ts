import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
// import { ListPage } from '../pages/list/list';
import { PrinterTestPage } from '../pages/printer-test/printer-test';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { InventoryDatabaseProvider } from '../providers/inventory-database/inventory-database';

@Component({
  templateUrl: 'app.html',
  host: { '(document:keypress)': 'handleKeyboardEvent($event)' }
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = PrinterTestPage;

  pages: Array<{ title: string; component: any }>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private inv: InventoryDatabaseProvider,
    private alertCtrl: AlertController
  ) {
    this.initializeApp();
    // used for an example of ngFor and navigation
    this.pages = [{ title: 'Home', component: HomePage }, { title: 'printer', component: PrinterTestPage }];
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    console.log(`${event.key} ${event.keyCode}`);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.hide();
      this.splashScreen.hide();
      this.inv.initialiceDB();
    });
  }

  clearData() {
    let alert = this.alertCtrl.create({
      title: 'Confirmar Borrado',
      message: 'Realmente desea reiniciar la base de datos?',
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
            this.inv.clearAllData();
          }
        }
      ]
    });
    alert.present();
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
