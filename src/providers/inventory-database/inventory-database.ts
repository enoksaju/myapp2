import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export interface inventoryRow {
  Id?: number;
  OT?: string;
  Material?: string;
  Ancho?: number;
  Calibre?: number;
  Peso: number;
  Tarima: number;
  Año: number;
  Mes: number;
  Linea: string;
  Tipo: string;
}

const default_: inventoryRow = {
  Id: null,
  OT: null,
  Material: 'Sin Especificar',
  Ancho: null,
  Calibre: null,
  Peso: null,
  Tarima: null,
  Año: null,
  Mes: null,
  Linea: null,
  Tipo: null
};

const insertStatement: string =
  'INSERT INTO "InvFisico" ("OT", "Material", "Ancho", "Calibre", "Peso", "Tarima", "Año", "Mes", "Linea", "Tipo") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

const createTableStatement: string =
  'CREATE TABLE IF NOT EXISTS  "InvFisico" ("Id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,	"OT"	TEXT NOT NULL,	"Material"	TEXT DEFAULT \'Sin Especificar\',	"Ancho"	NUMERIC DEFAULT 0,	"Calibre"	NUMERIC DEFAULT 0,	"Peso"	NUMERIC NOT NULL,	"Tarima"	INTEGER NOT NULL,	"Año"	INTEGER NOT NULL,	"Mes"	INTEGER NOT NULL,"Linea" TEXT NOT NULL DEFAULT \'LN\', "Tipo" TEXT NOT NULL);';

const selectFromMonthYearStatement: string =
  'SELECT I."Id", I."OT", I."Material", I."Ancho", I."Calibre", I."Peso", I."Tarima",I."Año",I."Mes", I."Linea", I."Tipo" FROM InvFisico I WHERE I."Año" = ? and I."Mes"= ? and I."Linea"= ?;';

const deleteStatement: string = 'DELETE FROM "InvFisico" WHERE "Id" = ?;';
/*
  Generated class for the InventoryDatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class InventoryDatabaseProvider {
  private DB: SQLiteObject = null;
  private data: BehaviorSubject<inventoryRow[]> = new BehaviorSubject([]);
  año: number = new Date().getFullYear();
  mes: number = new Date().getMonth();
  linea: string = '';
  Tipo: string = '';

  isInitialice: boolean = false;
  constructor(private sqlite: SQLite) {
    console.log('Hello InventoryDatabaseProvider Provider');
  }

  initialiceDB(yr: number = null, mt: number = null, ln: string = null, tp: string = null): Promise<boolean> {
    this.año = yr != null ? yr : this.año;
    this.mes = mt != null ? mt : this.mes;
    this.linea = ln != null ? ln : this.linea;
    this.Tipo = tp != null ? tp : this.Tipo;

    return new Promise((resolve, rejected) => {
      this.sqlite
        .create({
          name: 'ionicdb.db',
          location: 'default'
        })
        .then((db: SQLiteObject) => {
          db.executeSql(createTableStatement, null)
            .then(res => {
              this.DB = db;
              this.isInitialice = true;
              console.log('Executed SQL and asign to object, initialice is true');
              resolve(true);
            })
            .catch(e => {
              console.log(e);
              rejected(e);
            });
        });
    });
  }

  insert(row: inventoryRow): Promise<boolean> {
    Object.keys(row).forEach(element => {
      if (row[element] !== null && row[element].toString().trim() === '') {
        delete row[element];
      }
    });
    const value = Object.assign(default_, row);

    return new Promise((resolve, rejected) => {
      if (this.isInitialice) {
        this.DB.executeSql(insertStatement, [
          value.OT,
          value.Material,
          value.Ancho,
          value.Calibre,
          value.Peso,
          value.Tarima,
          value.Año,
          value.Mes,
          value.Linea,
          value.Tipo
        ])
          .then(r => {
            this.DB.executeSql('select last_insert_rowid() as rw from InvFisico LIMIT 1', []).then(res => {
              if (res.rows.length > 0) {
                row.Id = res.rows.item(0).rw;
              }
              console.log('row inserted');
              this.refreshData()
                .then(res => resolve(res))
                .catch(rej => rejected(rej));
            });
          })
          .catch(e => {
            rejected(e);
          });
      } else {
        rejected('No se ha inicializado la base de datos');
      }
    });
  }

  deleteElement(Id: number): Promise<boolean> {
    return new Promise((resolve, rejected) => {
      if (this.isInitialice) {
        this.DB.executeSql(deleteStatement, [Id])
          .then(res => {
            this.refreshData()
              .then(res => resolve(res))
              .catch(rej => rejected(rej));
          })
          .catch(rej => rejected(rej));
      } else {
        rejected('No se ha inicializado la base de datos');
      }
    });
  }

  clearAllData(): Promise<boolean> {
    return new Promise((resolve, rejected) => {
      this.DB.sqlBatch(['DROP TABLE "InvFisico";', createTableStatement])
        .then(res => {
          this.refreshData()
            .then(res => resolve(res))
            .catch(rej => rejected(rej));
        })
        .catch(rej => rejected(rej));
    });
  }

  refreshData(): Promise<boolean> {
    return new Promise((resolve, rejected) => {
      this.DB.executeSql(selectFromMonthYearStatement, [this.año, this.mes, this.linea])
        .then(res => {
          var rows: inventoryRow[] = [];
          for (var i = 0; i < res.rows.length; i++) {
            var rw = res.rows.item(i) as inventoryRow;
            rows.push(rw);
          }
          this.data.next(rows);
          resolve(true);
        })
        .catch(e => rejected(e));
    });
  }

  getElements(): Observable<inventoryRow[]> {
    return this.data.asObservable();
  }
}
