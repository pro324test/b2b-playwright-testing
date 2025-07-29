import { ContentManagement } from "@/types/ourApiSepecifc/ContentManagement";
import { formatFileUrl } from "@/utils/formatFileUrl";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  contentManagement: ContentManagement;
};

export default function ContentManagementSection({ contentManagement }: Props) {
  return (
    <div
      className="padding-x h-[400px] flex justify-around gap-20 items-center"
      style={{
        backgroundColor: contentManagement.backgroundColor || "transparent",
      }}
    >
      <div className="flex flex-col gap-4 flex-1">
        <h4 className="text-3xl font-bold">{contentManagement.title}</h4>
        <p>{contentManagement.description}</p>
        {contentManagement.link ? (
          <Link
            href={contentManagement.link}
            target="_blank"
            className="main-button !bg-white !text-black w-fit"
          >
            See more
          </Link>
        ) : (
          ""
        )}
      </div>
      {contentManagement.images?.length ? (
        <div className="flex-1">
          <div>
            <Image
              src={formatFileUrl(contentManagement.images[0].imageUrl)}
              alt="Content"
              width={1000}
              height={1000}
              className="w-[50%] h-[50%]"
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
