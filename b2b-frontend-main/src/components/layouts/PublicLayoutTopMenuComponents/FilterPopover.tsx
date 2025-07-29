"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { assetsConstants } from "@/constants/assetsConstants";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import RadixRangeSlider from "@/components/globals/RadixRangeSlider";

const colors: { name: string; hex: string }[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Gray", hex: "#808080" },
  { name: "Dark Gray", hex: "#A9A9A9" },
  { name: "Light Gray", hex: "#D3D3D3" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Purple", hex: "#800080" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Olive", hex: "#808000" },
  { name: "Teal", hex: "#008080" },
  { name: "Navy", hex: "#000080" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Gold", hex: "#FFD700" },
  // { name: "Silver", hex: "#C0C0C0" },
  // { name: "Bronze", hex: "#CD7F32" },
  // { name: "Coral", hex: "#FF7F50" },
  // { name: "Indigo", hex: "#4B0082" },
  // { name: "Violet", hex: "#EE82EE" },
  // { name: "Lavender", hex: "#E6E6FA" },
  // { name: "Mint", hex: "#98FF98" },
  // { name: "Peach", hex: "#FFDAB9" },
  // { name: "Salmon", hex: "#FA8072" },
  //   { name: "Plum", hex: "#DDA0DD" },
  //   { name: "Khaki", hex: "#F0E68C" },
  //   { name: "Turquoise", hex: "#40E0D0" },
  //   { name: "Chocolate", hex: "#D2691E" },
];

interface Category {
  name: string;
  children?: Category[]; // Optional children property for subcategories
}

const categories: Category[] = [
  {
    name: "Electronics",
    children: [
      { name: "Mobile Phones" },
      { name: "Laptops" },
      { name: "Cameras" },
      { name: "Televisions" },
    ],
  },
  {
    name: "Fashion",
    children: [
      { name: "Men's Clothing" },
      { name: "Women's Clothing" },
      { name: "Shoes" },
      { name: "Accessories" },
    ],
  },
  {
    name: "Home & Kitchen",
    children: [
      { name: "Furniture" },
      { name: "Appliances" },
      { name: "Cookware" },
      { name: "Decor" },
    ],
  },
  {
    name: "Books",
    children: [
      { name: "Fiction" },
      { name: "Non-Fiction" },
      { name: "Educational" },
      { name: "Comics" },
    ],
  },
  {
    name: "Sports & Outdoors",
    children: [
      { name: "Sports Equipment" },
      { name: "Outdoor Gear" },
      { name: "Fitness" },
    ],
  },
];

const criteria = [
  "Latest Products",
  "Most Popular",
  "Best Rated",
  "Available Now",
];

const brands = [
  "Apple",
  "Samsung",
  "Google",
  "Microsoft",
  "Sony",
  "LG",
  "Huawei",
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Acer",
  "Xiaomi",
  "OnePlus",
  "Motorola",
  "Nokia",
  "Intel",
  "AMD",
  "NVIDIA",
  "Qualcomm",
  "Panasonic",
  "Philips",
  "Toshiba",
  "Vivo",
  "Oppo",
  "Realme",
];

export default function FilterPopover() {
  const websiteDirection = useWebsiteDirection();
  const [fromPrice, setFromPrice] = useState("0");
  const [toPrice, setToPrice] = useState("1000");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Image
            src={assetsConstants.filterIcon}
            alt="filter"
            width={100}
            height={100}
            className="w-[30px] h-[30px]"
          />
        </PopoverTrigger>
        <PopoverContent
          className={`w-[97vw] max-h-[75vh] overflow-hidden overflow-y-auto bg-color mt-4 ${
            websiteDirection == "ltr" ? "mr-4" : "ml-4"
          }`}
        >
          {/* first section */}
          <div className="bg-white p-4 rounded-lg shadow-md flex gap-8 items-center">
            <div className="w-[50rem]">
              <p>Price</p>
              <div className="flex gap-4">
                <div className="flex gap-4 items-center flex-1">
                  <Label htmlFor="price-from">From </Label>
                  <Input
                    id="price-from"
                    type="number"
                    value={fromPrice}
                    onChange={(e) => setFromPrice(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 items-center flex-1">
                  <Label htmlFor="price-to">To </Label>
                  <Input
                    id="price-to"
                    type="number"
                    value={toPrice}
                    onChange={(e) => setToPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <RadixRangeSlider
                  min={0}
                  max={1000}
                  values={[parseInt(fromPrice), parseInt(toPrice)]}
                  onValueChange={(value) => {
                    setFromPrice(value[0].toString());
                    setToPrice(value[1].toString());
                  }}
                />
              </div>
            </div>
            <div className="w-[60%]">
              <p>Color</p>
              <div className="flex gap-2 overflow-x-auto">
                {colors.map((color) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      className={`w-[28px] h-[28px] flex justify-center items-center rounded-full border-2 ${
                        isSelected ? " border-black" : ""
                      }`}
                      style={{ backgroundColor: color.hex, flexShrink: 0 }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedColors(
                            selectedColors.filter((c) => c !== color.name)
                          );
                        } else {
                          setSelectedColors([...selectedColors, color.name]);
                        }
                      }}
                    >
                      {isSelected ? <FaCheck /> : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* second section */}
          <div className="flex gap-8 my-8 max-h-[40vh] overflow-hidden">
            {/* categories section */}
            <div className="bg-white p-4 flex-1 rounded-lg">
              <p className="text-center text-2xl font-bold">Categories</p>
              <div className="flex flex-col overflow-y-auto h-full">
                {categories.map((category) => {
                  // if (!category.children?.length) {
                  //   return (
                  //     <div key={category.name}>
                  //       <Checkbox id={category.name} />
                  //       <Label htmlFor={category.name}>{category.name}</Label>
                  //     </div>
                  //   );
                  // }
                  return (
                    <Accordion type="single" collapsible key={category.name}>
                      <AccordionItem value={category.name}>
                        <AccordionTrigger className="flex gap-4 items-center">
                          <span className="flex gap-4">
                            <Checkbox id={category.name} />
                            <span>{category.name}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-4 ml-4">
                            {category.children?.map((subCategory) => {
                              return (
                                <div
                                  key={subCategory.name}
                                  className="flex gap-4 items-center"
                                >
                                  <Checkbox id={subCategory.name} />
                                  <Label htmlFor={subCategory.name}>
                                    {subCategory.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
                <div className="mb-4"></div>
              </div>
            </div>
            {/* brands section */}
            <div className="bg-white p-4 flex-1 rounded-lg overflow-hidden">
              <p className="text-center text-2xl font-bold">Brands</p>
              <div className="flex flex-col gap-2 h-full overflow-y-auto">
                {brands.map((brand) => {
                  return (
                    <div key={brand} className="flex gap-4 items-center">
                      <Checkbox id={brand} />
                      <Label htmlFor={brand}>{brand}</Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* criteria section */}
          <div>
            <div className="bg-white p-4 rounded-lg grid grid-cols-2 gap-4">
              {criteria.map((criterion) => {
                return (
                  <div key={criterion} className="flex gap-4 items-center">
                    <Checkbox id={criterion} />
                    <Label htmlFor={criterion}>{criterion}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex mt-4 gap-4">
            <button className="main-button">Apply Filters</button>
            <button className="main-button !bg-red-600">Clear All</button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
