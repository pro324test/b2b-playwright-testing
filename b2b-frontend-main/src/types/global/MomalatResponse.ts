// To parse this data:
//
//   import { Convert, MoamalatResponse } from "./file";
//
//   const moamalatResponse = Convert.toMoamalatResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MoamalatResponse {
  Message: null;
  Success: boolean;
  TotalCountAllTransaction: number;
  Transactions: Transaction[];
}

export interface Transaction {
  Date: string;
  DateTotalAmount: string;
  DateTransactions: DateTransaction[];
}

export interface DateTransaction {
  Amnt: string;
  AmountTrxn: string;
  CardNo: string;
  CardType: string;
  Currency: string;
  ExternalTxnId: null;
  FeeAmnt: string;
  IsRefundEnabled: boolean;
  IsSend: boolean;
  MerchantReference: string;
  MobileNumber: null;
  RRN: string;
  ReceiptNo: string;
  ResCodeDesc: string;
  STAN: string;
  SenderName: null;
  Status: string;
  TipAmnt: string;
  TransType: string;
  TransactionChannel: string;
  TransactionId: string;
  TxnDateTime: string;
}

// // Converts JSON strings to/from your types
// // and asserts the results of JSON.parse at runtime
// export class Convert {
//   public static toMoamalatResponse(json: string): MoamalatResponse {
//     return cast(JSON.parse(json), r("MoamalatResponse"));
//   }

//   public static moamalatResponseToJson(value: MoamalatResponse): string {
//     return JSON.stringify(uncast(value, r("MoamalatResponse")), null, 2);
//   }
// }

// function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
//   const prettyTyp = prettyTypeName(typ);
//   const parentText = parent ? ` on ${parent}` : "";
//   const keyText = key ? ` for key "${key}"` : "";
//   throw Error(
//     `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
//       val
//     )}`
//   );
// }

// function prettyTypeName(typ: any): string {
//   if (Array.isArray(typ)) {
//     if (typ.length === 2 && typ[0] === undefined) {
//       return `an optional ${prettyTypeName(typ[1])}`;
//     } else {
//       return `one of [${typ
//         .map((a) => {
//           return prettyTypeName(a);
//         })
//         .join(", ")}]`;
//     }
//   } else if (typeof typ === "object" && typ.literal !== undefined) {
//     return typ.literal;
//   } else {
//     return typeof typ;
//   }
// }

// function jsonToJSProps(typ: any): any {
//   if (typ.jsonToJS === undefined) {
//     const map: any = {};
//     typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
//     typ.jsonToJS = map;
//   }
//   return typ.jsonToJS;
// }

// function jsToJSONProps(typ: any): any {
//   if (typ.jsToJSON === undefined) {
//     const map: any = {};
//     typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
//     typ.jsToJSON = map;
//   }
//   return typ.jsToJSON;
// }

// function transform(
//   val: any,
//   typ: any,
//   getProps: any,
//   key: any = "",
//   parent: any = ""
// ): any {
//   function transformPrimitive(typ: string, val: any): any {
//     if (typeof typ === typeof val) return val;
//     return invalidValue(typ, val, key, parent);
//   }

//   function transformUnion(typs: any[], val: any): any {
//     // val must validate against one typ in typs
//     const l = typs.length;
//     for (let i = 0; i < l; i++) {
//       const typ = typs[i];
//       try {
//         return transform(val, typ, getProps);
//       } catch {}
//     }
//     return invalidValue(typs, val, key, parent);
//   }

//   function transformEnum(cases: string[], val: any): any {
//     if (cases.indexOf(val) !== -1) return val;
//     return invalidValue(
//       cases.map((a) => {
//         return l(a);
//       }),
//       val,
//       key,
//       parent
//     );
//   }

//   function transformArray(typ: any, val: any): any {
//     // val must be an array with no invalid elements
//     if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
//     return val.map((el) => transform(el, typ, getProps));
//   }

//   function transformDate(val: any): any {
//     if (val === null) {
//       return null;
//     }
//     const d = new Date(val);
//     if (isNaN(d.valueOf())) {
//       return invalidValue(l("Date"), val, key, parent);
//     }
//     return d;
//   }

//   function transformObject(
//     props: { [k: string]: any },
//     additional: any,
//     val: any
//   ): any {
//     if (val === null || typeof val !== "object" || Array.isArray(val)) {
//       return invalidValue(l(ref || "object"), val, key, parent);
//     }
//     const result: any = {};
//     Object.getOwnPropertyNames(props).forEach((key) => {
//       const prop = props[key];
//       const v = Object.prototype.hasOwnProperty.call(val, key)
//         ? val[key]
//         : undefined;
//       result[prop.key] = transform(v, prop.typ, getProps, key, ref);
//     });
//     Object.getOwnPropertyNames(val).forEach((key) => {
//       if (!Object.prototype.hasOwnProperty.call(props, key)) {
//         result[key] = transform(val[key], additional, getProps, key, ref);
//       }
//     });
//     return result;
//   }

//   if (typ === "any") return val;
//   if (typ === null) {
//     if (val === null) return val;
//     return invalidValue(typ, val, key, parent);
//   }
//   if (typ === false) return invalidValue(typ, val, key, parent);
//   let ref: any = undefined;
//   while (typeof typ === "object" && typ.ref !== undefined) {
//     ref = typ.ref;
//     typ = typeMap[typ.ref];
//   }
//   if (Array.isArray(typ)) return transformEnum(typ, val);
//   if (typeof typ === "object") {
//     return typ.hasOwnProperty("unionMembers")
//       ? transformUnion(typ.unionMembers, val)
//       : typ.hasOwnProperty("arrayItems")
//       ? transformArray(typ.arrayItems, val)
//       : typ.hasOwnProperty("props")
//       ? transformObject(getProps(typ), typ.additional, val)
//       : invalidValue(typ, val, key, parent);
//   }
//   // Numbers can be parsed by Date but shouldn't be.
//   if (typ === Date && typeof val !== "number") return transformDate(val);
//   return transformPrimitive(typ, val);
// }

// function cast<T>(val: any, typ: any): T {
//   return transform(val, typ, jsonToJSProps);
// }

// function uncast<T>(val: T, typ: any): any {
//   return transform(val, typ, jsToJSONProps);
// }

// function l(typ: any) {
//   return { literal: typ };
// }

// function a(typ: any) {
//   return { arrayItems: typ };
// }

// function u(...typs: any[]) {
//   return { unionMembers: typs };
// }

// function o(props: any[], additional: any) {
//   return { props, additional };
// }

// function m(additional: any) {
//   return { props: [], additional };
// }

// function r(name: string) {
//   return { ref: name };
// }

// const typeMap: any = {
//   MoamalatResponse: o(
//     [
//       { json: "Message", js: "Message", typ: null },
//       { json: "Success", js: "Success", typ: true },
//       {
//         json: "TotalCountAllTransaction",
//         js: "TotalCountAllTransaction",
//         typ: 0,
//       },
//       { json: "Transactions", js: "Transactions", typ: a(r("Transaction")) },
//     ],
//     false
//   ),
//   Transaction: o(
//     [
//       { json: "Date", js: "Date", typ: "" },
//       { json: "DateTotalAmount", js: "DateTotalAmount", typ: "" },
//       {
//         json: "DateTransactions",
//         js: "DateTransactions",
//         typ: a(r("DateTransaction")),
//       },
//     ],
//     false
//   ),
//   DateTransaction: o(
//     [
//       { json: "Amnt", js: "Amnt", typ: "" },
//       { json: "AmountTrxn", js: "AmountTrxn", typ: "" },
//       { json: "CardNo", js: "CardNo", typ: "" },
//       { json: "CardType", js: "CardType", typ: "" },
//       { json: "Currency", js: "Currency", typ: "" },
//       { json: "ExternalTxnId", js: "ExternalTxnId", typ: null },
//       { json: "FeeAmnt", js: "FeeAmnt", typ: "" },
//       { json: "IsRefundEnabled", js: "IsRefundEnabled", typ: true },
//       { json: "IsSend", js: "IsSend", typ: true },
//       { json: "MerchantReference", js: "MerchantReference", typ: "" },
//       { json: "MobileNumber", js: "MobileNumber", typ: null },
//       { json: "RRN", js: "RRN", typ: "" },
//       { json: "ReceiptNo", js: "ReceiptNo", typ: "" },
//       { json: "ResCodeDesc", js: "ResCodeDesc", typ: "" },
//       { json: "STAN", js: "STAN", typ: "" },
//       { json: "SenderName", js: "SenderName", typ: null },
//       { json: "Status", js: "Status", typ: "" },
//       { json: "TipAmnt", js: "TipAmnt", typ: "" },
//       { json: "TransType", js: "TransType", typ: "" },
//       { json: "TransactionChannel", js: "TransactionChannel", typ: "" },
//       { json: "TransactionId", js: "TransactionId", typ: "" },
//       { json: "TxnDateTime", js: "TxnDateTime", typ: "" },
//     ],
//     false
//   ),
// };
