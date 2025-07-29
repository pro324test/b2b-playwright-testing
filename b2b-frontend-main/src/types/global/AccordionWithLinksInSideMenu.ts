import { ReactNode } from "react";
import { SideMenuLink } from "./SideMenuLink";

export interface AccordionWithLinksInSideMenu {
  label: string;
  icon?: ReactNode;
  children: SideMenuLink[];
}
