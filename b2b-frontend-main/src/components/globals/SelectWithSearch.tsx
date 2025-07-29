"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LuChevronsUpDown } from "react-icons/lu";
import { BiCheck } from "react-icons/bi";
import { useAppSelector } from "@/redux/config/hooks";
import RingEffect from "../loaders/RingEffect";
import { SelectWithSearchData } from "@/types/global/SelectWithSearchData";

type Props<T> = {
  setSelectedValue: React.Dispatch<React.SetStateAction<T | null>>;
  data: SelectWithSearchData<T>[];
  isLoading: boolean;
  placeholder: string;
  emptyContent?: React.ReactNode;
  disabled?: boolean;
};

export default function SelectWithSearch<T>({
  setSelectedValue,
  data,
  isLoading,
  placeholder,
  emptyContent,
  disabled,
}: Props<T>) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<T | "">("");
  const [searchInput, setSearchInput] = useState("");

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {value
              ? data.find((d) => d.id.toString() == value || d.value == value)
                  ?.label
              : placeholder}
            <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 ">
          <Command>
            <CommandInput
              placeholder={"Search..."}
              value={searchInput}
              onValueChange={(newValue) => {
                setSearchInput(newValue);
              }}
            />
            {isLoading ? (
              <div className="flex justify-center items-center">
                <RingEffect />
              </div>
            ) : (
              ""
            )}

            {!isLoading ? (
              <CommandEmpty>
                {emptyContent || dictionary.sorryNoResultsFound}
              </CommandEmpty>
            ) : (
              ""
            )}

            <CommandList className="max-h-[250px] overflow-auto">
              <CommandGroup>
                {data?.map((d) => (
                  <CommandItem
                    className="text-black !opacity-100 !pointer-events-auto !cursor-pointer flex justify-between items-center"
                    key={d.id}
                    value={d.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue as T);
                      setSelectedValue(d.complexValue);
                      setOpen(false);
                    }}
                  >
                    <span>{d.label}</span>
                    {value == d.value ? <BiCheck className={""} /> : ""}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
