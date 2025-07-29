import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import UsersContentContainer from "./components/UsersContentContainer";

type Props = {
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  const key = Math.random();
  return <UsersContentContainer queryParams={queryParams} key={`${key}`} />;
}
