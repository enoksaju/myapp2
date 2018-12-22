export enum Rotations {
  default = 0,
  r90 = 90,
  r180 = 180,
  r270 = 270,
}

export interface Work {
  id: number;
  name: string;
  width: number;
  height: number;
  unit: 'mm' | 'in';
  labels: LabelsItem[];
}

export interface LabelsItem {
  copies: number;
  barcodes?: BarcodesItem[];
  bars?: BarsItem[];
  QrCodes?: QrCodesItem[];
  Lines?: LinesItem[];
  reverseZone?: ReverseZoneItem[];
  images?: ImagesItem[];
  Boxs?: BoxsItem[];
  Texts?: TextsItem[];
}

export interface BarcodesItem {
  x: number;
  y: number;
  height: number;
  value: string;
  BarCodeoptions?: {
    CodeType?: '128' | '128M' | 'EAN128' | '25' | '25C' | '39' | '39C' | '93' | 'EAN13' | 'EAN13+2' | 'EAN13+5' | 'EAN8' | 'EAN8+2' | 'EAN8+5' | 'CODA' | 'POST' | 'UPCA' | 'UPCA+2' | 'UPCA+5' | 'UPCE' | 'UPCE+2' | 'UPCE+5';
    humanReadable?: boolean;
    rotation?: Rotations;
    narrow?: number;
    wide?: number;
  };
}
export interface BarsItem {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface QrCodesItem {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
}
export interface LinesItem {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness?: number;
}
export interface ReverseZoneItem {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ImagesItem {
  x: number;
  y: number;
  src: string;
  light?: number;
}
export interface BoxsItem {
  x: number;
  y: number;
  width: number;
  height: number;
  options?: { line_thickness?: number; radious?: number };
}
export interface TextsItem {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  textOptions?: {
    format?: 'bold' | 'normal' | 'italic' | 'bold italic';
    fontName?: string;
    rotation?: Rotations;
  };
}
