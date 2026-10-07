import { useState } from "react";
import { BiTrash, BiPencil } from "react-icons/bi";
import Button from "react-bootstrap/Button";
import { CgEyeAlt } from "react-icons/cg";
import { DeleteModal } from "./deleteModal";
import { ViewModal } from "./viewModal";
import { EditModal } from "./editModal";

type TableOperationProps = {
  id: string;
  onDelete: (id: string) => unknown;
  onView: (id: string) => unknown;
  viewRecord: unknown;
};

export const TableOperation = ({
  id,
  onDelete,
  onView,
  viewRecord,
}: TableOperationProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <td style={{ width: "150px" }}>
      <Button
        variant="outline-danger"
        aria-label="Delete item"
        className="me-2"
        onClick={() => setShowDelete(true)}
      >
        <BiTrash />
      </Button>
      <Button
        variant="outline-danger"
        aria-label="Delete item"
        className="me-2"
        onClick={() => setShowEdit(true)}
      >
        <BiPencil />
      </Button>
      <Button
        variant="outline-danger"
        aria-label="Delete item"
        onClick={() => {
          setShowView(true);
          onView(id);
        }}
      >
        <CgEyeAlt />
      </Button>

      <DeleteModal
        show={showDelete}
        setShow={setShowDelete}
        id={id}
        onDelete={onDelete}
      />
      <ViewModal
        show={showView}
        setShow={setShowView}
        viewRecord={viewRecord}
      />
      <EditModal show={showEdit} setShow={setShowEdit} />
    </td>
  );
};

export default TableOperation;
