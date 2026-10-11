import { BiTrash, BiPencil } from "react-icons/bi";
import { useId } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { CgEyeAlt } from "react-icons/cg";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type TableOperationProps = {
  onDeleteClick: () => void;
  onViewClick: () => void;
  onEditClick: () => void;
  pages: PageConfig;
};

export const TableOperation = ({
  onDeleteClick,
  onViewClick,
  onEditClick,
  pages,
}: TableOperationProps) => {
  const editTooltipId = useId();
  const deleteTooltipId = useId();
  const viewTooltipId = useId();

  return (
    <td style={{ width: "150px" }}>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={deleteTooltipId}>
            {getPageText(pages, "deleteTooltip")}
          </Tooltip>
        }
      >
        <Button
          variant="outline-danger"
          aria-label={getPageText(pages, "deleteAriaLabel")}
          className="me-2"
          onClick={onDeleteClick}
        >
          <BiTrash />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={editTooltipId}>
            {getPageText(pages, "editTooltip")}
          </Tooltip>
        }
      >
        <Button
          variant="outline-danger"
          aria-label={getPageText(pages, "editAriaLabel")}
          className="me-2"
          onClick={onEditClick}
        >
          <BiPencil />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={viewTooltipId}>
            {getPageText(pages, "viewTooltip")}
          </Tooltip>
        }
      >
        <Button
          variant="outline-danger"
          aria-label={getPageText(pages, "viewAriaLabel")}
          onClick={onViewClick}
        >
          <CgEyeAlt />
        </Button>
      </OverlayTrigger>
    </td>
  );
};

export default TableOperation;
