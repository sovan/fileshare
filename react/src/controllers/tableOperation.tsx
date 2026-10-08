import { BiTrash, BiPencil } from "react-icons/bi";
import Button from "react-bootstrap/Button";
import { CgEyeAlt } from "react-icons/cg";

type TableOperationProps = {
  onDeleteClick: () => void;
  onViewClick: () => void;
  setShowEdit: (show: boolean) => void;
};

export const TableOperation = ({
  onDeleteClick,
  onViewClick,
  setShowEdit,
}: TableOperationProps) => {
  return (
    <td style={{ width: "150px" }}>
      <Button
        variant="outline-danger"
        aria-label="Delete item"
        className="me-2"
        onClick={onDeleteClick}
      >
        <BiTrash />
      </Button>
      <Button
        variant="outline-danger"
        aria-label="Edit item"
        className="me-2"
        onClick={() => setShowEdit(true)}
      >
        <BiPencil />
      </Button>
      <Button
        variant="outline-danger"
        aria-label="View item"
        onClick={onViewClick}
      >
        <CgEyeAlt />
      </Button>
    </td>
  );
};

export default TableOperation;
