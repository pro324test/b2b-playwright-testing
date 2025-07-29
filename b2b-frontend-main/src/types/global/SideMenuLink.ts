import { RoleOfAuthEntity } from "./AuthEntity";

export interface SideMenuLink {
  href: () => string;
  label: string;
  specific_for: (RoleOfAuthEntity | "*")[];
  roles: (RoleOfAuthEntity | "*")[];
  icon: React.ReactNode;
}
