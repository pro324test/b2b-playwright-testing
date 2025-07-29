"use client";

import { assetsConstants } from "@/constants/assetsConstants";
import { useAppSelector } from "@/redux/config/hooks";
import Image from "next/image";
import React from "react";
import QRCode from "react-qr-code";
import styles from "./styles/PublicFooterStyles.module.css";
import Link from "next/link";

const socialMediaIcons = [
  assetsConstants.youtube,
  assetsConstants.twitter,
  assetsConstants.dribbble,
  assetsConstants.instagram,
];

export default function PublicFooter() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );

  return (
    <footer className={`${styles["container"]}`}>
      {/* first section */}
      <div className="relative z-[10]">
        <h4 className="text-xl font-bold mb-4">{dictionary.downloadTheApp}</h4>
        <div className="flex gap-4">
          <div className="flex flex-col ">
            <Image
              src={assetsConstants.googlePlayIcon}
              alt="Google Play"
              width={100}
              height={100}
              className="w-[110px] h-[40px]"
            />
            <Image
              src={assetsConstants.appStoreIcon}
              alt="App Store"
              width={100}
              height={100}
              className="w-[110px] h-[40px]"
            />
          </div>
          <div className="">
            <QRCode value="https://ejjumla.com" size={80} />
          </div>
        </div>
      </div>
      {/* second section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xl font-bold mb-4">{dictionary.shopNow}</h4>
        <p>{dictionary.favouriteList}</p>
        <p>{dictionary.myOrders}</p>
        <p>{dictionary.myAccount}</p>
        <p>{dictionary.myAccount}</p>
        <p>{dictionary.shopNow}</p>
        <p>{dictionary.contactUs}</p>
        <p>{dictionary.faq}</p>
      </div>
      {/* third section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xl font-bold mb-4">{dictionary.information}</h4>
        <p>{dictionary.privacyPolicy}</p>
        <p>{dictionary.termsAndCondtionsForSale}</p>
        <p>{dictionary.termsOfUseAgreement}</p>
        <p>{dictionary.returnPolicy}</p>
        <p>{dictionary.aboutTheApp}</p>
      </div>
      {/* fourth section */}
      <div className="flex flex-col justify-center gap-2">
        <h4 className="text-xl font-bold mb-4">{dictionary.copyRight}</h4>
        <div className="flex gap-8">
          {socialMediaIcons.map((icon, index) => (
            <Link
              href={"#"}
              key={index}
              className="bg-[#06b6b8]  rounded-[50%] p-2"
            >
              <Image
                src={icon}
                alt="Social Media Icon"
                width={100}
                height={100}
                className="w-[20px] h-[20px]"
              />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
