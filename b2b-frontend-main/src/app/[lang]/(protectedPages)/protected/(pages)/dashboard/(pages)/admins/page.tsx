import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import AdminsContentContainer from "./components/AdminsContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <AdminsContentContainer queryParams={queryParams} key={key} />;
}
