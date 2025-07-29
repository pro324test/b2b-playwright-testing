import { routes } from "@/constants/routesConstants";
import { AuthEntity } from "@/types/global/AuthEntity";
import { Dictionary } from "@/types/global/Dictionary";
import { Lang } from "@/types/global/Lang";
import { SideMenuLink } from "@/types/global/SideMenuLink";
import { GiPriceTag } from "react-icons/gi";
import { TbBrandCashapp } from "react-icons/tb";
import { FaImage, FaUsers } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { RiAdminFill, RiCoupon3Fill } from "react-icons/ri";
import { PiFlagBannerFill } from "react-icons/pi";
import { VscListUnordered } from "react-icons/vsc";

export function getSideMenuLinksData({
  lang,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dictionary,
  authEntity,
}: {
  lang: Lang;
  dictionary: Dictionary;
  authEntity: AuthEntity | null;
}) {
  const sideMenuLinksData: SideMenuLink[] = [
    {
      href: () => routes.dashboardUsers.href({ lang }),
      label: "Users",
      specific_for: ["admin", "superadmin"],
      roles: ["admin", "superadmin"],
      icon: <FaUsers />,
    },

    {
      href: () => routes.dashboardAdmins.href({ lang }),
      label: "Admins",
      specific_for: ["admin", "superadmin"],
      roles: ["admin", "superadmin"],
      icon: <RiAdminFill />,
    },
    {
      href: () => routes.dashboardCoupons.href({ lang }),
      label: "Coupons",
      specific_for: ["admin", "superadmin", "vendor"],
      roles: ["admin", "superadmin", "vendor"],
      icon: <RiCoupon3Fill />,
    },
    {
      href: () => routes.dashboardPriceRules.href({ lang }),
      label: "Price Rules",
      specific_for: ["vendor", "admin", "superadmin"],
      roles: ["vendor", "admin", "superadmin"],
      icon: <GiPriceTag />,
    },
    {
      href: () => routes.dashboardMoamalat.href({ lang }),
      label: "Moamalat",
      specific_for: ["vendor", "admin", "superadmin"],
      roles: ["vendor", "admin", "superadmin"],
      icon: <TbBrandCashapp />,
    },
    {
      href: () => routes.dashboardBannerTypes.href({ lang }),
      label: "Banner Types",
      specific_for: ["admin", "superadmin"],
      roles: ["admin", "superadmin"],
      icon: <PiFlagBannerFill />,
    },
    {
      href: () => routes.dashboardOrders.href({ lang }),
      label: "Orders",
      specific_for: ["admin", "superadmin"],
      roles: ["admin", "superadmin"],
      icon: <VscListUnordered />,
    },
    {
      href: () => routes.dashboardSliders.href({ lang }),
      label: "Sliders",
      specific_for: ["admin", "superadmin"],
      roles: ["admin", "superadmin"],
      icon: <FaImage />,
    },
  ];

  if (authEntity != null && authEntity?.role === "vendor") {
    sideMenuLinksData.push({
      href: () => routes.dashboardMyShops.href({ lang }),
      label: "My Shops",
      specific_for: ["vendor"],
      roles: ["vendor"],
      icon: <FaShop />,
    });
  }

  return sideMenuLinksData;
}
