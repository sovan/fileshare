import { useId, useState, type ReactElement } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import type { PageConfig } from "../utils/pageConfig";
import { getTableButtons, type TableButtonConfig } from "../utils/tableActions";
import { ConfiguredIcon } from "./configuredIcon";

const withTooltip = (button: ReactElement, label: string, id: string) =>
  label ? (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={id}>{label}</Tooltip>}
    >
      {button}
    </OverlayTrigger>
  ) : (
    button
  );

type TableRecord = Record<string, unknown> & { _id: string };

type TableOperationProps = {
  onDeleteClick: () => void;
  onViewClick: () => void;
  onEditClick: () => void;
  onCustomAction: (
    action: TableButtonConfig,
    record: TableRecord,
  ) => Promise<void>;
  record: TableRecord;
  pages: PageConfig;
};

export const TableOperation = ({
  onDeleteClick,
  onViewClick,
  onEditClick,
  onCustomAction,
  record,
  pages,
}: TableOperationProps) => {
  const tooltipId = useId();
  const [runningAction, setRunningAction] = useState<string>();
  const buttons = getTableButtons(pages.tableButtons);

  const onClick = async (button: TableButtonConfig) => {
    if (button.type === "delete") onDeleteClick();
    else if (button.type === "edit") onEditClick();
    else if (button.type === "view") onViewClick();
    else {
      setRunningAction(button.id);
      try {
        await onCustomAction(button, record);
      } finally {
        setRunningAction(undefined);
      }
    }
  };

  return (
    <td>
      <div className="d-flex flex-wrap gap-2">
        {buttons.map((button, index) => {
          const tooltip = button.tooltip ?? "";
          const ariaLabel = button.ariaLabel ?? button.label;
          const showLabel = button.icon
            ? (button.showLabel ?? button.showLable ?? false)
            : true;
          return withTooltip(
            <Button
              key={button.id}
              variant={button.variant || "outline-danger"}
              aria-label={ariaLabel}
              disabled={runningAction === button.id}
              onClick={() => {
                void onClick(button);
              }}
            >
              {button.icon && (
                <ConfiguredIcon
                  pages={pages}
                  setting=""
                  iconName={button.icon}
                  aria-hidden="true"
                />
              )}
              {showLabel && (
                <span className={button.icon ? "ms-1" : undefined}>
                  {button.label}
                </span>
              )}
            </Button>,
            tooltip,
            `${tooltipId}-${index}`,
          );
        })}
      </div>
    </td>
  );
};

export default TableOperation;
