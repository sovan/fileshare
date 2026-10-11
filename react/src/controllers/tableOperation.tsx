import { BiTrash, BiPencil } from "react-icons/bi";
import { useId, type ReactElement } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { CgEyeAlt } from "react-icons/cg";
import { getPageText, type PageConfig } from "../utils/pageConfig";

const withTooltip = (
  button: ReactElement,
  pages: PageConfig,
  key: string,
  id: string,
) =>
  pages[key] == null ? (
    button
  ) : (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={id}>{getPageText(pages, key)}</Tooltip>}
    >
      {button}
    </OverlayTrigger>
  );

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
      {withTooltip(
        <Button
          variant="outline-danger"
          aria-label={getPageText(pages, "deleteAriaLabel")}
          className="me-2"
          onClick={onDeleteClick}
        >
          <BiTrash />
        </Button>,
        pages,
        "deleteTooltip",
        deleteTooltipId,
      )}
      {withTooltip(
        <Button
          variant="outline-danger"
          aria-label={getPageText(pages, "editAriaLabel")}
          className="me-2"
          onClick={onEditClick}
        >
          <BiPencil />
        </Button>,
        pages,
        "editTooltip",
        editTooltipId,
      )}
      {withTooltip(
        <Button
          variant="outline-danger"
          aria-label={getPageText(pages, "viewAriaLabel")}
          onClick={onViewClick}
        >
          <CgEyeAlt />
        </Button>,
        pages,
        "viewTooltip",
        viewTooltipId,
      )}
    </td>
  );
};

export default TableOperation;
