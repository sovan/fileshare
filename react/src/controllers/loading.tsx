import Spinner from "react-bootstrap/Spinner";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type LoadingProps = {
  pages: PageConfig;
};

export const Loading = ({ pages }: LoadingProps) => (
  <div
    className="d-flex align-items-center gap-2"
    role="status"
    aria-live="polite"
  >
    <Spinner animation="border" size="sm" aria-hidden="true" />
    <span>{getPageText(pages, "loadingMessage")}</span>
  </div>
);
