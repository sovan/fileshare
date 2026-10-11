import BootstrapPagination from "react-bootstrap/Pagination";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  pages: PageConfig;
};

const getAlignmentClass = (pages: PageConfig): string => {
  switch (pages.paginationAlignment) {
    case "left":
      return "justify-content-start";
    case "right":
      return "justify-content-end";
    case "center":
    default:
      return "justify-content-center";
  }
};

export const Pagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  pages,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <BootstrapPagination className={getAlignmentClass(pages)}>
      <BootstrapPagination.First
        aria-label={getPageText(pages, "firstPage")}
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage(1)}
      />
      <BootstrapPagination.Prev
        aria-label={getPageText(pages, "previousPage")}
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      />
      <BootstrapPagination.Item active>{`${currentPage} / ${totalPages}`}</BootstrapPagination.Item>
      <BootstrapPagination.Next
        aria-label={getPageText(pages, "nextPage")}
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      />
      <BootstrapPagination.Last
        aria-label={getPageText(pages, "lastPage")}
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage(totalPages)}
      />
    </BootstrapPagination>
  );
};

export default Pagination;
