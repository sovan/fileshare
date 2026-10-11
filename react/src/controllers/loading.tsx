import { getPageText, type PageConfig } from "../utils/pageConfig";

type LoadingProps = {
  pages: PageConfig;
};

export const Loading = ({ pages }: LoadingProps) => (
  <div>{getPageText(pages, "loadingMessage")}</div>
);
