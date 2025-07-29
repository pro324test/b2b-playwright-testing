import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { Lang } from "@/types/global/Lang";
import { getDictionary } from "@/localization/config/getDictionary";
import NProgressProvider from "@/providers/NProgressProvider";
import SessionAuthProvider from "@/providers/SessionAuthProvider";
import WebsiteLayoutForClientPurposes from "@/components/layouts/WebsiteLayoutForClientPurposes";
import ReduxProvider from "@/redux/config/ReduxProvider";
import WebsiteLayoutForProtectedPagesPurposes from "@/components/layouts/WebsiteLayoutForProtectedPagesPurposes";
import LayoutDecider from "@/components/layouts/LayoutDecider";

// import global styles
import "./styles/shadcnui.css";
import "./styles/themes.css";
import "./styles/tables.css";
import "./styles/globals.css";
import "./styles/utility.css";

// import swiper styles
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "B2B",
  description: "B2B Description",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{
    lang: Lang;
  }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <html lang={lang} dir={lang == "ar" ? "rtl" : "ltr"}>
      <body className={`${cairo.className}`}>
        <NextTopLoader color={"#00f"} height={40} />
        <NProgressProvider>
          <SessionAuthProvider>
            <ReduxProvider>
              <WebsiteLayoutForClientPurposes dictionary={dictionary}>
                <WebsiteLayoutForProtectedPagesPurposes>
                  <LayoutDecider>{children}</LayoutDecider>
                </WebsiteLayoutForProtectedPagesPurposes>
              </WebsiteLayoutForClientPurposes>
            </ReduxProvider>
          </SessionAuthProvider>
        </NProgressProvider>
      </body>
    </html>
  );
}
