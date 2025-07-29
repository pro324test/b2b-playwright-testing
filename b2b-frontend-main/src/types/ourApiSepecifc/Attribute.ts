import { AttributeValue } from "./AttributeValue";

export interface Attribute {
  id: number;
  name: string;
  description: string;
  isEnabled: boolean;
  values?: AttributeValue[];
}
