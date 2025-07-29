"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/redux/config/hooks";
import { Attribute } from "@/types/ourApiSepecifc/Attribute";
import { AttributeValue } from "@/types/ourApiSepecifc/AttributeValue";
import { Product } from "@/types/ourApiSepecifc/Product";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { attributesRequests } from "@/requests/ourApi/attributesRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { AxiosResponse } from "axios";
import { IoClose } from "react-icons/io5";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "next/navigation";
import { productVariantsRequests } from "@/requests/ourApi/productVariantsRequests";

type Props = {
  product: Product;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateProductVariantModal({
  product,
  isOpen,
  setIsOpen,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const router = useRouter();
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [activeAttribute, setActiveAttribute] = useState<Attribute | null>(
    null
  );
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<
    AttributeValue[]
  >([]);

  const canSubmit =
    sku && quantity && lowStockThreshold && attributes.length > 0;

  const submitHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await productVariantsRequests.create({
        privateAxios,
        data,
      });
      toastSuccessMessage({ response, dictionary });
      router.refresh();
      setIsOpen(false);
      setSku("");
      setQuantity("");
      setLowStockThreshold("");
      setSelectedAttributeValues([]);
      setActiveAttribute(null);
    } catch (error) {
      extractErrorAndToastIt({
        error,
        dictionary,
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function fetchAttributes() {
      try {
        const resposne: AxiosResponse<PaginatedResponse<Attribute>> =
          await attributesRequests.getAll({ queryParams: { limit: "1000" } });
        setAttributes(resposne.data.data);
      } catch {}
    }
    if (isOpen) {
      fetchAttributes();
    }
  }, [isOpen]);

  const attributeValuesSelectedFromAttributeIds = selectedAttributeValues.map(
    (value) => value.attributeId
  );

  const displayedAttributes = attributes.filter(
    (attribute) =>
      !attributeValuesSelectedFromAttributeIds.includes(attribute.id)
  );

  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>
              Create Variant for
              <span className="text-blue-600">&apos;{product.name}&apos;</span>
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const data: any = {
                    productId: product.id,
                    sku,
                    quantity: +quantity,
                    lowStockThreshold: +lowStockThreshold,
                  };
                  if (selectedAttributeValues.length) {
                    data.attributeValueIds = selectedAttributeValues.map(
                      (value) => value.id
                    );
                  }
                  if (price) {
                    data.price = +price;
                  }

                  submitHandler(data);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    type="text"
                    id="sku"
                    placeholder="SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    type="number"
                    id="price"
                    placeholder="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    id="quantity"
                    placeholder="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="low-stock-threshhold">
                    Low Stock Threshhold
                  </Label>
                  <Input
                    type="number"
                    id="low-stock-threshhold"
                    placeholder="Low Stock Threshhold"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="attributes">Attributes</Label>
                  <Select
                    onValueChange={(newValue) => {
                      setActiveAttribute(
                        attributes.find(
                          (attribute) => `${attribute.id}` === newValue
                        ) || null
                      );
                    }}
                    value={activeAttribute ? `${activeAttribute.id}` : ""}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select an attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Attributes</SelectLabel>
                        {displayedAttributes.map((attribute) => (
                          <SelectItem
                            key={attribute.id}
                            value={`${attribute.id}`}
                          >
                            {attribute.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {activeAttribute ? (
                  <div className="mt-4">
                    <Label htmlFor="attribute-values">
                      Attribute Value Of {activeAttribute.name}
                    </Label>
                    <Select
                      onValueChange={(newValue) => {
                        const selectedValue = activeAttribute.values?.find(
                          (value) => `${value.id}` === newValue
                        );
                        if (selectedValue) {
                          setSelectedAttributeValues((prev) => [
                            ...prev,
                            { ...selectedValue, attribute: activeAttribute },
                          ]);
                          setActiveAttribute(null);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select an attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            Attribute Value Of {activeAttribute.name}
                          </SelectLabel>
                          {activeAttribute.values?.map((attributeValue) => (
                            <SelectItem
                              key={attributeValue.id}
                              value={`${attributeValue.id}`}
                            >
                              {attributeValue.value}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  ""
                )}

                {selectedAttributeValues.length ? (
                  <div className="my-8">
                    <Label htmlFor="selected-attribute-values">
                      Selected Attribute Values
                    </Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {selectedAttributeValues.map((value) => (
                        <span
                          key={value.id}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-2xl"
                        >
                          <span>{value?.attribute?.name}: </span>
                          <span>{value.value}</span>
                          <button
                            className="bg-red-600 rounded-full text-white-600 transition-colors hover:bg-red-700"
                            onClick={() => {
                              setSelectedAttributeValues((prev) =>
                                prev.filter((v) => v.id !== value.id)
                              );
                            }}
                          >
                            <IoClose />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  ""
                )}

                <div className="flex gap-4">
                  <button
                    disabled={!canSubmit || isLoading}
                    className="mt-8 bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.confirm}
                  </button>
                  <button
                    disabled={isLoading}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-8 bg-red-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-red-700"
                  >
                    {dictionary.cancel}
                  </button>
                </div>
              </form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
