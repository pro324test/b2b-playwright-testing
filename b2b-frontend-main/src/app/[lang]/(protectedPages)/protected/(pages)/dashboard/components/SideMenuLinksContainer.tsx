"use client";

import React, { useEffect, useRef } from "react";
import styles from "./styles/SideMenuLinksContainerStyles.module.css";
import Link from "next/link";
import useLang from "@/hooks/useLang";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/config/hooks";
import useWindowWidth from "@/hooks/useWindowWidth";
import { getSideMenuLinksData } from "../utils/getSideMenuLinks";
import { getAccordionWithLinksInSideMenu } from "../utils/getAccordionWithLinksInSideMenu";

type Props = {
  setIsSideMenuActive: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SideMenuLinksContainer({ setIsSideMenuActive }: Props) {
  const windowWidth = useWindowWidth();
  const lang = useLang();
  const pathname = usePathname();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);

  const sideMenuLinks = useRef(
    getSideMenuLinksData({ lang, dictionary, authEntity: authEntity }).filter(
      (sideMenuLink) => {
        if (authEntity == null) {
          return false;
        }
        const typeSuffice =
          sideMenuLink.specific_for.includes("*") ||
          sideMenuLink.specific_for.includes(authEntity?.role);
        const roleSuffice =
          sideMenuLink.roles.includes("*") ||
          sideMenuLink.roles.includes(authEntity?.role);
        return typeSuffice && roleSuffice;
      }
    )
  );

  const accordionWithSideMenuLinks = useRef(
    getAccordionWithLinksInSideMenu({
      lang,
      dictionary,
      authEntity: authEntity,
    })
      .map((accordionWithLinks) => ({
        ...accordionWithLinks,
        children: accordionWithLinks.children.filter((sideMenuLink) => {
          if (authEntity == null) {
            return false;
          }
          const typeSuffice =
            sideMenuLink.specific_for.includes("*") ||
            sideMenuLink.specific_for.includes(authEntity?.role);
          const roleSuffice =
            sideMenuLink.roles.includes("*") ||
            sideMenuLink.roles.includes(authEntity?.role);
          return typeSuffice && roleSuffice;
        }),
      }))
      .filter((accordionWithLinks) => accordionWithLinks.children.length > 0) // Ensure only accordions with children are included
  );

  useEffect(() => {
    if (windowWidth < 767) {
      setIsSideMenuActive(false);
    }
    // eslint-disable-next-line
  }, [pathname]);
  return (
    <>
      <div className={styles["container"]}>
        {sideMenuLinks.current.map((sideMenuLink, index) => {
          const href = sideMenuLink.href();
          return (
            <Link
              key={`${index}-${sideMenuLink.label}`}
              href={href}
              className={`${styles["link"]} ${
                pathname == href ? styles["active"] : ""
              }`}
            >
              {sideMenuLink.icon}
              <span>{sideMenuLink.label}</span>
            </Link>
          );
        })}
        {/* accordion with links */}
        {accordionWithSideMenuLinks.current.map((accordionWithLinks) => {
          // const isAccordionAllowedToBeDisplayedInSideMenu =
          //   isAllowedToDisplayAccordionInSideMenu({
          //     accordionWithLinks,
          //     userPermissionStringFormatted:
          //       currentUser?.permissions_string_formatted || [],
          //   });
          // if (!isAccordionAllowedToBeDisplayedInSideMenu) {
          //   return <></>;
          // }
          // if (accordionWithLinks.children.length == 1) {
          //   return accordionWithLinks.children.map((sideMenuLinkObj) => {
          //     const linkIsActive = pathname == sideMenuLinkObj.href();
          //     return (
          //       <Link
          //         key={sideMenuLinkObj.label}
          //         href={sideMenuLinkObj.href()}
          //         className={`${styles["link"]} ${
          //           linkIsActive ? styles["active"] : ""
          //         }`}
          //       >
          //         {sideMenuLinkObj.icon}
          //         <span>{sideMenuLinkObj.label}</span>
          //       </Link>
          //     );
          //   });
          // }
          return (
            <Accordion
              type="single"
              collapsible
              aria-expanded
              className="p-0 pb-0"
              key={accordionWithLinks.label}
            >
              <AccordionItem
                value={accordionWithLinks.label}
                className={styles["accordion-item"]}
              >
                <AccordionTrigger className="p-0 pb-0 flex gap-2 items-center">
                  <span className="flex gap-2 items-center">
                    {accordionWithLinks.icon || ""}
                    <span className="text-xl">{accordionWithLinks.label}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {accordionWithLinks.children.map((sideMenuLinkObj) => {
                    const linkIsActive = pathname == sideMenuLinkObj.href();
                    // const isAllowedToDisplay = isAllowedToDisplayInSideMenu({
                    //   sideMenuLink: sideMenuLinkObj.href(),
                    //   userPermissionStringFormatted:
                    //     currentUser?.permissions_string_formatted || [],
                    // });
                    // if (!isAllowedToDisplay) {
                    //   return <></>;
                    // }
                    return (
                      <Link
                        key={sideMenuLinkObj.label}
                        href={sideMenuLinkObj.href()}
                        className={`${styles["link"]} ${
                          linkIsActive ? styles["active"] : ""
                        }`}
                      >
                        {sideMenuLinkObj.icon}
                        <span>{sideMenuLinkObj.label}</span>
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
        <div className="h-[75px]"></div>
      </div>
    </>
  );
}
