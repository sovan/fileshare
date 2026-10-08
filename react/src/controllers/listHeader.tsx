import { Row, Col, Button } from "react-bootstrap";
import { AddModal } from "./addModal";

type ListHeaderProps = {
  getSchema: () => void;
  onSubmit: (payload: object) => void;
  setShowAdd: (show: boolean) => void;
  schema: unknown;
  serverError: unknown;
  showAdd: boolean;
  insertingData: boolean;
};

export const ListHeader = ({
  getSchema,
  onSubmit,
  setShowAdd,
  schema,
  serverError,
  showAdd,
  insertingData,
}: ListHeaderProps) => {
  return (
    <Row>
      <Col>
        <h3>This is a Bootstrap Heading</h3>
      </Col>
      <Col className="text-end">
        <Button
          variant="primary"
          onClick={() => {
            setShowAdd(true);
            getSchema();
          }}
        >
          Add user
        </Button>
      </Col>
      <AddModal
        setShow={setShowAdd}
        onSubmit={onSubmit}
        show={showAdd}
        schema={schema}
        serverError={serverError}
        disabled={insertingData}
      />
    </Row>
  );
};

export default ListHeader;
