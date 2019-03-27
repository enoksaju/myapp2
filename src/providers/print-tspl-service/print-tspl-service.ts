import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { LoadingController, ToastController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BrowserQRCodeSvgWriter } from '@zxing/library';
import {
  Rotations,
  BarcodesItem,
  BarsItem,
  QrCodesItem,
  LinesItem,
  ReverseZoneItem,
  ImagesItem,
  BoxsItem,
  TextsItem,
  Work
} from './interfacesLabel';
import { DecimalPipe, DatePipe, PercentPipe, CurrencyPipe } from '@angular/common';
import { isNumber } from 'ionic-angular/util/util';

/*
  Generated class for the PrintTsplServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

const crlf = '\r\n';
let cmd: string;

const alarm = {
  ft_: Function,
  start: function(ft: Function) {
    this.cancel();
    this.ft_ = ft;
    this.timeoutID = window.setTimeout(
      function() {
        this.ft_();
        this.timeoutID = undefined;
      }.bind(this),
      20000,
      null
    );
  },
  cancel: function() {
    window.clearTimeout(this.timeoutID);
  }
};

@Injectable()
export class PrintTsplServiceProvider {
  private c$: Subscription;
  private DeviceMAC: string;
  get Code() {
    return cmd;
  }

  constructor(
    private bt: BluetoothSerial,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private dec_pipe: DecimalPipe,
    private date_pipe: DatePipe,
    private per_pipe: PercentPipe,
    private curr_pipe: CurrencyPipe
  ) {}

  private dictionary(entity: any, str: string) {
    let listPar = str.match(
      /(@)+\w+[.]*\w*[.]*\w*([ ]*[,]{1}[ ]*[nNdDpPcC]{1,1}[ ]*:{1}[ ]*)*([0-9]{1,}.{1}[0-9]{1,}-{1}[0-9]{1,})*([dMLywEaBbhHmsz \\/.\-_])*(([A-Z]{3}[ _]*)*[0-9]{1,}.{1}[1-9]{1,}-{1}[0-9]{1,})*(@)+/g
    ); // new RegExp(/(@)+\w/g).// RegExp..Matches(str,  );
    let str_ = str;
    listPar.forEach(mc => {
      let format = mc
        .split(' ')
        .join('')
        .trim()
        .split(',');
      let props = format[0]
        .replace('@', '')
        .replace('@', '')
        .split('.');
      let val: any;
      switch (props.length) {
        case 1:
          val = entity[props[0]];
          break;
        case 2:
          val = entity[props[0]][props[1]];
          break;
        case 3:
          val = entity[props[0]][props[1]][props[2]];
          break;
      }
      if (val !== undefined) {
        if (format.length > 1) {
          let sets = format[1]
            .replace('@', '')
            .trim()
            .split(':');
          switch (sets[0]) {
            case 'n':
            case 'N':
              if (isNumber(val)) {
                let valor = sets.length > 1 ? sets[1] : null;
                val = this.dec_pipe.transform(val, valor);
              }
              break;
            case 'd':
            case 'D':
              if (val.constructor.name === 'Date') {
                let valor = sets.length > 1 ? sets[1] : null;
                val = this.date_pipe.transform(val, valor);
              }
              break;
            case 'c':
            case 'C':
              if (isNumber(val)) {
                let valor = sets.length > 1 ? sets[1] : null;
                val = this.curr_pipe.transform(val, null, 'symbol', valor);
              }
              break;
            case 'p':
            case 'P':
              if (isNumber(val)) {
                let valor = sets.length > 1 ? sets[1] : null;
                val = this.per_pipe.transform(val, valor);
              }
              break;
          }
        }

        str_ = str_.replace(mc, val.toString());
      }
    });
    return str_;
  }

  private conectar(id: string) {
    return new Promise((resolve, reject) => {
      alarm.start(() => {
        this.desconectar();
      });

      this.bt
        .isConnected()
        .then(() => {
          resolve('conectado');
        })
        .catch(() => {
          this.c$ = this.bt.connect(id).subscribe(
            (data: Observable<any>) => {
              setTimeout(() => {
                resolve('conectado');
              }, 2000);
            },
            fail => {
              console.error(`[3] Error conexión: ${JSON.stringify(fail)}`);
              reject('No se pudo conectar');
            }
          );
        });
    });
  }
  private desconectar() {
    if (this.c$) {
      this.c$.unsubscribe();
    }
    return this.bt.disconnect();
  }
  private convertImageToTSPL(src: string, x: number, y: number, light: number = 128) {
    return new Promise<string>((resolve, reject) => {
      const imageObj = new Image();

      imageObj.onload = () => {
        try {
          let cv = document.createElement('canvas');
          const ctx = cv.getContext('2d');
          let widthNormalized = imageObj.width + (imageObj.width % 8 !== 0 ? 8 - (imageObj.width % 8) : 0);
          cv.height = imageObj.height;
          cv.width = widthNormalized;
          ctx.drawImage(imageObj, 0, 0);

          let factor = Math.floor(widthNormalized / 8);
          let imageData = ctx.getImageData(0, 0, widthNormalized, imageObj.height);
          let pix = imageData.data;
          let arr = '',
            arr8 = '';
          let cnt = 0,
            cnt8 = 0;

          for (var i = 0, n = pix.length; i < n; i += 4) {
            let promCol = pix[i] * 0.3 + pix[i + 1] * 0.59 + pix[i + 2] * 0.114; // (pix[i] + pix[i + 1] + pix[i + 2]) / 3;

            var bw = promCol < light && pix[i + 3] > light ? 0 : 1;
            cnt++;
            let dif = imageObj.width - factor * 8;
            if (cnt <= dif || cnt % (factor * 8) == 0 || cnt % (factor * 8) > dif) {
              if (cnt8 < 7) {
                arr8 += bw; // == 255 ? 1 : 0;
                cnt8++;
              } else {
                arr8 += bw; // == 255 ? 1 : 0;
                let hex = parseInt(arr8, 2).toString(16);
                arr += this.hex_to_ascii(hex.length <= 1 ? '0' + hex : hex);
                arr8 = '';
                cnt8 = 0;
              }
            }
            if (cnt % imageObj.width == 0) {
              cnt = 0;
            }
          }

          cv.remove();
          imageObj.remove();
          resolve(`BITMAP ${x},${y},${factor},${imageObj.height},0,${arr}`);
        } catch (error) {
          imageObj.remove();
          reject('');
        }
      };
      imageObj.src = src;
    });
  }
  private hex_to_ascii(str1: string) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  }

  setDeviceMAC(MAC: string) {
    this.DeviceMAC = MAC;
  }

  initLabel(width: number, height: number, unit: 'mm' | 'in') {
    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      let unit_ = unit == 'mm' ? ' ' + unit : '';
      cmd = `SIZE ${width}${unit_}, ${height}${unit_}${crlf}CLS${crlf}`;
      resolve(this);
    });
  }

  endPageLabel(Copies: number, clearLast: boolean = false) {
    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      cmd += `PRINT ${Copies}${crlf}${clearLast ? `CLS${crlf}` : ''}`;
      resolve(this);
    });
  }

  async buildFromWork(work: Work, entity: any = {}) {
    const loader = this.loadingCtrl.create({
      content: `Construyendo el trabajo: ${work.name}...`
    });
    loader.present();
    cmd = '';
    try {
      if (work.labels.length > 0) {
        await this.initLabel(work.width, work.height, work.unit);

        for (let Ilbl = 0; Ilbl < work.labels.length; Ilbl++) {
          const label = work.labels[Ilbl];

          if (label.Texts !== undefined) {
            for (let item = 0; item < label.Texts.length; item++) {
              const element = label.Texts[item];
              await this.drawTextG(element, entity);
            }
          }
          if (label.images !== undefined) {
            for (let item = 0; item < label.images.length; item++) {
              const element = label.images[item];
              await this.drawImage(element);
            }
          }

          if (label.bars !== undefined) {
            label.bars.forEach(async element => {
              await this.drawBar(element);
            });
          }

          if (label.images !== undefined) {
            label.QrCodes.forEach(async element => {
              await this.drawQRCode(element, entity);
            });
          }

          if (label.barcodes !== undefined) {
            label.barcodes.forEach(async element => {
              await this.drawBarcode(element, entity);
            });
          }

          if (label.Lines !== undefined) {
            label.Lines.forEach(async element => {
              await this.drawLine(element);
            });
          }

          if (label.Boxs !== undefined) {
            label.Boxs.forEach(async element => {
              await this.drawBox(element);
            });
          }

          if (label.reverseZone !== undefined) {
            for (let item = 0; item < label.reverseZone.length; item++) {
              const element = label.reverseZone[item];
              await this.drawReverseZone(element);
            }
          }
          if (Ilbl < work.labels.length - 1) {
            await this.endPageLabel(label.copies, true);
          } else {
            await this.endPageLabel(label.copies, false);
          }
        }
        loader.dismiss();
        return this;
      } else {
        loader.dismiss();
        const toast = this.toastCtrl.create({
          message: 'Error al construir el trabajo',
          duration: 3000
        });
        toast.present();
        cmd = '';
        return this;
      }
    } catch (error) {
      console.log(error);
      loader.dismiss();
    }
  }

  drawBarcode(barCodeConfig: BarcodesItem, entity: any = {}) {
    const defaults = { codeType: '39', humanreadable: true, rotation: Rotations.default, narrow: 2, wide: 4 };
    const settings = Object.assign(defaults, barCodeConfig.BarCodeoptions);
    let humanReadable_ = settings.humanreadable ? 1 : 0;

    let val = this.dictionary(entity, barCodeConfig.value);

    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      cmd += `BARCODE ${barCodeConfig.x},${barCodeConfig.y},"${settings.codeType}",${
        barCodeConfig.height
      },${humanReadable_},${settings.rotation},${settings.narrow},${settings.wide},"${val}"${crlf}`;
      resolve(this);
    });
  }

  drawBar(barConfig: BarsItem) {
    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      cmd += `BAR ${barConfig.x},${barConfig.y},${barConfig.width},${barConfig.height}${crlf}`;
      resolve(this);
    });
  }

  drawQRCode(qrConfig: QrCodesItem, entity: any = {}) {
    const width = qrConfig.width - (qrConfig.width % 8);
    const height = qrConfig.height - (qrConfig.height % 8);

    let val = this.dictionary(entity, qrConfig.value);

    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      const wt = new BrowserQRCodeSvgWriter(document.createElement('div'));
      this.convertImageToTSPL(
        'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(wt.write(val, width, height))),
        qrConfig.x,
        qrConfig.y,
        128
      )
        .then(val => {
          cmd += `${val}${crlf}`;
          resolve(this);
        })
        .catch(error => reject(error));
    });
  }

  drawLine(lineConfig: LinesItem) {
    let thickness = lineConfig.thickness ? lineConfig.thickness : 1;
    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      cmd += `DIAGONAL ${lineConfig.x1},${lineConfig.y1},${lineConfig.x2},${lineConfig.y2},${thickness}${crlf}`;
      resolve(this);
    });
  }

  drawReverseZone(reverseZoneConfig: ReverseZoneItem) {
    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      cmd += `REVERSE ${reverseZoneConfig.x},${reverseZoneConfig.y},${reverseZoneConfig.width},${
        reverseZoneConfig.height
      }${crlf}`;
      resolve(this);
    });
  }

  drawImage(ImageConfig: ImagesItem) {
    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      this.convertImageToTSPL(ImageConfig.src, ImageConfig.x, ImageConfig.y, ImageConfig.light)
        .then(val => {
          cmd += `${val}${crlf}`;
          resolve(this);
        })
        .catch(error => reject(error));
    });
  }

  drawBox(boxConfig: BoxsItem) {
    const defaults = { line_thickness: 1, radious: 0 };
    const settings = Object.assign(defaults, boxConfig.options);
    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      cmd += `BOX ${boxConfig.x},${boxConfig.y},${boxConfig.x + boxConfig.width},${boxConfig.y + boxConfig.height},${
        settings.line_thickness
      },${settings.radious}${crlf}`;
      resolve(this);
    });
  }

  drawTextG(textConfig: TextsItem, entity: any = {}) {
    const defaults = { fontName: 'Arial', format: 'normal', rotation: Rotations.default };
    const settings = Object.assign(defaults, textConfig.textOptions);
    let val = this.dictionary(entity, textConfig.value);

    return new Promise<PrintTsplServiceProvider>((resolve, reject) => {
      try {
        if (settings.fontName === '' || settings.fontName === null || settings.fontName === undefined) {
          settings.fontName = 'Arial';
        }

        let font_ = `${settings.format} ${textConfig.fontSize}px ${settings.fontName}`,
          cv = document.createElement('canvas'),
          ctx = cv.getContext('2d'),
          fontSize = textConfig.fontSize,
          rotation = settings.rotation,
          x = 0.1 * fontSize,
          y = 0;
        ctx.font = font_;
        let measure = ctx.measureText(val);

        switch (rotation) {
          case Rotations.r90:
          case Rotations.r270:
            cv.height = measure.width + 0.2 * fontSize;
            cv.width = fontSize * 1.1;
            break;
          default:
            cv.height = textConfig.fontSize * 1.1;
            cv.width = measure.width + 0.22 * fontSize;
            break;
        }

        switch (rotation) {
          case Rotations.default:
            y = fontSize * 0.8;
            break;
          case Rotations.r90:
            ctx.translate(0.2 * fontSize, 0);
            y = -0.1 * fontSize;
            break;
          case Rotations.r180:
            ctx.translate(cv.width, 0.2 * fontSize);
            y = -0.1 * fontSize;
            break;
          case Rotations.r270:
            ctx.translate(cv.width, cv.height);
            y = -0.28 * fontSize;
            break;
        }

        ctx.font = font_;
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(val, x, y);

        this.drawImage({ src: cv.toDataURL(), x: textConfig.x, y: textConfig.y, light: 128 }).then(dt => {
          cv.remove();
          resolve(this);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  Print(copies: number = 1, customCommands: string = null) {
    let toSend: string;
    if (customCommands) {
      toSend = customCommands;
    } else {
      toSend = cmd;
    }
    this.bt
      .isEnabled()
      .then(() => {
        const loader = this.loadingCtrl.create({
          content: 'Conectando e Imprimiendo, por favor espere...'
        });
        loader.present();
        this.conectar(this.DeviceMAC)
          .then(() => {
            this.bt.write(toSend);
            setTimeout(() => {
              loader.dismiss();
            }, 1000);
          })
          .catch(e => {
            loader.dismiss();
            const toast = this.toastCtrl.create({
              message: 'No se pudo conectar a la impresora',
              duration: 3000
            });
            toast.present();
          });
      })
      .catch(() => {
        const toast = this.toastCtrl.create({
          message: 'Bluetooth no disponible o apagado',
          duration: 3000
        });
        toast.present();
      });
  }
}
