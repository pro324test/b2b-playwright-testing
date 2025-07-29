import { Attribute } from "./Attribute";

export interface AttributeValue {
  id: number;
  value: string;
  hexValue?: null | string;
  attributeId: number;
  attribute?: Attribute | null;
}
