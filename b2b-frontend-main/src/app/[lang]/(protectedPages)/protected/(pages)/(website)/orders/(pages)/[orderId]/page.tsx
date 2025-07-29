import React from "react";
import SingleOrderContentContainer from "./components/SingleOrderContentContainer";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { orderId } = await params;
  if (isNaN(Number(orderId))) {
    return <div>Invalid order id</div>;
  }
  const key = Math.random();
  return <SingleOrderContentContainer orderId={Number(orderId)} key={key} />;
}
