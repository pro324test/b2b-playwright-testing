import { Lang } from "@/types/global/Lang";

const protectedRoutesPrefix = "protected";
const dashboardRoutesPrefix = "dashboard";

export const routes = {
  home: {
    href: ({ lang }: { lang: Lang }) => `/${lang}`,
    startsWith: ({ lang }: { lang: Lang }) => `/${lang}/auth/login`,
  },
  protected: {
    href: ({ lang }: { lang: Lang }) => `/${lang}/${protectedRoutesPrefix}`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}`,
  },
  userLogin: {
    href: ({
      lang,
      pagePathToRedirectTo,
    }: {
      lang: Lang;
      pagePathToRedirectTo?: string;
    }) =>
      `/${lang}/auth/users/login${
        pagePathToRedirectTo ? `?redirect_to=${pagePathToRedirectTo}` : ""
      }`,
    startsWith: ({ lang }: { lang: Lang }) => `/${lang}/auth/login`,
  },
  userRegister: {
    href: ({
      lang,
      pagePathToRedirectTo,
    }: {
      lang: Lang;
      pagePathToRedirectTo?: string;
    }) =>
      `/${lang}/auth/users/register${
        pagePathToRedirectTo ? `?redirect_to=${pagePathToRedirectTo}` : ""
      }`,
    startsWith: ({ lang }: { lang: Lang }) => `/${lang}/auth/register`,
  },
  adminLogin: {
    href: ({
      lang,
      pagePathToRedirectTo,
    }: {
      lang: Lang;
      pagePathToRedirectTo?: string;
    }) =>
      `/${lang}/auth/admins/login${
        pagePathToRedirectTo ? `?redirect_to=${pagePathToRedirectTo}` : ""
      }`,
    startsWith: ({ lang }: { lang: Lang }) => `/${lang}/auth/admin`,
  },
  dashboard: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}`,
  },

  dashboardUsers: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/users`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/users`,
  },
  dashboardAdmins: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/admins`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/admins`,
  },
  dashboardVendors: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/vendors`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/vendors`,
  },
  dashboardVendorsRequests: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/vendors/requests`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/vendors/requests`,
  },
  dashboardVendorsGroups: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/vendors/groups`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/vendors/groups`,
  },
  dashboardShops: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops`,
  },
  dashboardShopRequests: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/requests`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/requests`,
  },
  dashboardCategories: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/categories/all`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/categories/all`,
  },
  dashboardRootCategories: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/categories/root`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/categories/root`,
  },
  dashboardSingleCategoryById: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/categories/singleCategory/${id}`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/categories/singleCategory`,
  },
  dashboardAttributes: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/attributes/all`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/attributes/all`,
  },
  dashboardSingleAttributeById: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/attributes/singleAttribute/${id}`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/attributes/singleAttribute`,
  },
  dashboardBrands: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/brands`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/brands`,
  },
  dashboardCities: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/cities`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/cities`,
  },
  dashboardProducts: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/products`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/products`,
  },
  dashboardSingleShop: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/${id}`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop`,
  },
  dashboardCreateProductForShop: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/${id}/createProduct`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/`,
  },
  dashboardEditProduct: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/singleProduct/${id}/edit`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/singleProduct/`,
  },
  dashboardSingleProduct: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/singleProduct/${id}/show`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/singleProduct/`,
  },
  dashboardMyShops: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/myShops`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/myShops`,
  },
  dashboardPriceRules: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/priceRules`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/priceRules`,
  },
  dashboardCoupons: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/coupons`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/coupons`,
  },
  dashboardBannerTypes: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/bannerTypes`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/bannerTypes`,
  },
  dashboardSingleShopBanners: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/${id}/banners`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/`,
  },
  dashboardSingleShopPromotions: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/${id}/promotions`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/`,
  },
  dashboardSingleShopAddresses: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/${id}/addresses`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/`,
  },
  dashboardSingleShopCoupons: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/${id}/coupons`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/shops/singleShop/`,
  },
  dashboardMoamalat: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/moamalat`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/moamalat`,
  },
  dashboardOrders: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/orders`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/orders`,
  },
  dashboardContentManagement: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement`,
  },
  dashboardContentManagementTypes: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement/types`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement/types`,
  },
  dashboardCreateContentManagement: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement/create`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement/create`,
  },
  dashboardEditContentManagement: {
    href: ({
      lang,
      contentmanagementId,
    }: {
      lang: Lang;
      contentmanagementId: number;
    }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement/${contentmanagementId}/edit`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/contentManagement/`,
  },
  dashboardSliders: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/sliders`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/${dashboardRoutesPrefix}/sliders`,
  },
  orders: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/orders`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/orders`,
  },
  singleOrder: {
    href: ({ lang, orderId }: { lang: Lang; orderId: number }) =>
      `/${lang}/${protectedRoutesPrefix}/orders/${orderId}`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/orders/`,
  },
  products: {
    href: ({ lang }: { lang: Lang }) => `/${lang}/products`,
    startsWith: ({ lang }: { lang: Lang }) => `/${lang}/products`,
  },
  singleProduct: {
    href: ({ lang, id }: { lang: Lang; id: number }) =>
      `/${lang}/singleProduct/${id}`,
    startsWith: ({ lang }: { lang: Lang }) => `/${lang}/singleProduct/`,
  },
  cart: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/cart`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/cart`,
  },
  becomeAVendor: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/becomeAVendor`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/becomeAVendor`,
  },
  stores: {
    href: ({ lang }: { lang: Lang }) => `/${lang}/stores`,
    startsWith: ({ lang }: { lang: Lang }) => `/${lang}/stores`,
  },
  favouriteProducts: {
    href: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/favouriteProducts`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/${protectedRoutesPrefix}/favouriteProducts`,
  },
  forgotPassword: {
    href: ({ lang }: { lang: Lang }) => `/${lang}/auth/users/forgotPassword`,
    startsWith: ({ lang }: { lang: Lang }) =>
      `/${lang}/auth/users/forgotPassword`,
  },
};
