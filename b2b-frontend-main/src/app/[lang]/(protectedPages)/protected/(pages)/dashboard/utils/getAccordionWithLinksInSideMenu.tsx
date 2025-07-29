import { routes } from "@/constants/routesConstants";
import { AccordionWithLinksInSideMenu } from "@/types/global/AccordionWithLinksInSideMenu";
import { AuthEntity } from "@/types/global/AuthEntity";
import { Dictionary } from "@/types/global/Dictionary";
import { Lang } from "@/types/global/Lang";

import { FaLayerGroup, FaProductHunt } from "react-icons/fa";
import { FaCodePullRequest, FaShop, FaTreeCity } from "react-icons/fa6";
import { IoIosBusiness } from "react-icons/io";
import { MdOutlineCategory } from "react-icons/md";
import { SiBrandfolder } from "react-icons/si";
import { RiAlignItemHorizontalCenterLine, RiTableView } from "react-icons/ri";
import { BiSolidBookContent } from "react-icons/bi";
import { LuClipboardType } from "react-icons/lu";

export function getAccordionWithLinksInSideMenu({
  lang,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dictionary,
  authEntity,
}: {
  lang: Lang;
  dictionary: Dictionary;
  authEntity: AuthEntity | null;
}) {
  const accordionWithLinksInSideMenu: AccordionWithLinksInSideMenu[] = [
    {
      label: "Vendors",
      icon: <IoIosBusiness />,
      children: [
        {
          href: () => routes.dashboardVendors.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
        {
          href: () => routes.dashboardVendorsRequests.href({ lang }),
          label: "Requests",
          icon: <FaCodePullRequest />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
        {
          href: () => routes.dashboardVendorsGroups.href({ lang }),
          label: "Groups",
          icon: <FaLayerGroup />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
      ],
    },
    {
      label: "Shops",
      icon: <FaShop />,
      children: [
        {
          href: () => routes.dashboardShops.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
        {
          href: () => routes.dashboardShopRequests.href({ lang }),
          label: "Requests",
          icon: <FaCodePullRequest />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
      ],
    },
    {
      label: "Categories",
      icon: <MdOutlineCategory />,
      children: [
        {
          href: () => routes.dashboardCategories.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
        {
          href: () => routes.dashboardRootCategories.href({ lang }),
          label: "Show Root",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
      ],
    },
    {
      label: "Attributes",
      icon: <RiAlignItemHorizontalCenterLine />,
      children: [
        {
          href: () => routes.dashboardAttributes.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
      ],
    },
    {
      label: "Brands",
      icon: <SiBrandfolder />,
      children: [
        {
          href: () => routes.dashboardBrands.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
      ],
    },
    {
      label: "Cities",
      icon: <FaTreeCity />,
      children: [
        {
          href: () => routes.dashboardCities.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
      ],
    },
    {
      label: "Content Management",
      icon: <BiSolidBookContent />,
      children: [
        {
          href: () => routes.dashboardContentManagement.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
        {
          href: () => routes.dashboardContentManagementTypes.href({ lang }),
          label: "Types",
          icon: <LuClipboardType />,
          specific_for: ["admin", "superadmin"],
          roles: ["admin", "superadmin"],
        },
      ],
    },
  ];

  if (
    authEntity != null &&
    authEntity.vendor != null &&
    authEntity.vendor != undefined &&
    authEntity.vendor.shops != null &&
    authEntity.vendor.shops.length > 0
  ) {
    accordionWithLinksInSideMenu.push({
      label: "Products",
      icon: <FaProductHunt />,
      children: [
        {
          href: () => routes.dashboardProducts.href({ lang }),
          label: "Show",
          icon: <RiTableView />,
          specific_for: ["vendor"],
          roles: ["vendor"],
        },
      ],
    });
  }
  return accordionWithLinksInSideMenu;
}
