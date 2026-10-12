import { useId, type ReactElement } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {
  getPageText,
  getPageVariant,
  type PageConfig,
} from "../utils/pageConfig";
import { ConfiguredIcon } from "./configuredIcon";

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
          variant={getPageVariant(pages, "deleteRowButtonVariant", "outline-danger")}
          aria-label={getPageText(pages, "deleteAriaLabel")}
          className="me-2"
          onClick={onDeleteClick}
        >
          <ConfiguredIcon pages={pages} setting="deleteIcon" />
        </Button>,
        pages,
        "deleteTooltip",
        deleteTooltipId,
      )}
      {withTooltip(
        <Button
          variant={getPageVariant(pages, "editRowButtonVariant", "outline-danger")}
          aria-label={getPageText(pages, "editAriaLabel")}
          className="me-2"
          onClick={onEditClick}
        >
          <ConfiguredIcon pages={pages} setting="editIcon" />
        </Button>,
        pages,
        "editTooltip",
        editTooltipId,
      )}
      {withTooltip(
        <Button
          variant={getPageVariant(pages, "viewRowButtonVariant", "outline-danger")}
          aria-label={getPageText(pages, "viewAriaLabel")}
          onClick={onViewClick}
        >
          <ConfiguredIcon pages={pages} setting="viewIcon" />
        </Button>,
        pages,
        "viewTooltip",
        viewTooltipId,
      )}
    </td>
  );
};

export default TableOperation;
