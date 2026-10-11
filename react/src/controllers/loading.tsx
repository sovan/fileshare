import Spinner from "react-bootstrap/Spinner";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type LoadingProps = {
  pages: PageConfig;
  centered?: boolean;
  large?: boolean;
};

export const Loading = ({
  pages,
  centered = false,
  large = false,
}: LoadingProps) => (
  <div
    className={`d-flex align-items-center ${large ? "gap-3" : "gap-2"}${centered ? " justify-content-center flex-column text-center" : ""}`}
    style={centered ? { minHeight: "60vh" } : undefined}
    role="status"
    aria-live="polite"
  >
    <Spinner
      animation="border"
      size={large ? undefined : "sm"}
      style={
        large
          ? { width: "4rem", height: "4rem", borderWidth: "0.4em" }
          : undefined
      }
      aria-hidden="true"
    />
    <span>{getPageText(pages, "loadingMessage")}</span>
  </div>
);
