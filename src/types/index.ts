export interface DispensingStation {
  name: string;
  id: string;
}

export interface Drug {
  CODE: string;
  NAME: string;
  DIANAME: string;
  DRUGKIND: string;
  MIN_PAKAGE: string;
}

export interface DeviceItem {
  Code: string;
  ChineseName: string;
  Scientific_Name: string;
  DRUGKIND: string;
  StorageName: string;
  Inventory: string;
  List_Validity_period: string[];
  List_Inventory: string[];
  List_Lot_number: string[];
  GUID: string;
  Max_shipping: number;
  IsWarning: boolean;
}

export interface ServerSettingRequest {
  ValueAry: string[];
}

export interface MedicationGroup {
  GUID: string;
  NAME: string;
  VIS_INFO: string;
  CT_TIME: string;
  MedClasses: Drug[];
}

export interface GroupResponse {
  Data: MedicationGroup[];
  Code: number;
  Method: string;
  Result: string;
}

export interface Transaction {
  OP_TIME: string;
  MED_BAG_NUM: string;
  PAT: string;
  MRN: string;
  OP: string;
  TXN_QTY: number;
  EBQ_QTY: number;
  RSN: string;
  STOREHOUSE: string;
  NOTE: string;
  CODE: string;
}

export interface TransactionRequest {
  ValueAry: [string, string, string, string];
}

export interface DrugReport {
  CODE: string;
  NAME: string;
  TRADE_NAME: string;
  CONTROL_LEVEL: string;
  MIN_UNIT: string;
  TOTAL_INCOME: number;
  TOTAL_EXPENSE: number;
  CONSUMPTION: number;
  transactions: Transaction[];
}

export interface Order {
  GUID: string;
  PRI_KEY: string;
  BRYPE: string;
  CODE: string;
  NAME: string;
  WARD: string;
  BEDNO: string;
  PATNAME: string;
  PATCODE: string;
  TXN_QTY: string;
  DISP_QTY: string;
  DUNIT: string;
  FREQ: string;
  RROUTE: string;
  DAYS: string;
  SD: string;
  ORD_START: string;
  ORD_END: string;
  CT_TIME: string;
  STATE: string;
  NOTE: string;
}