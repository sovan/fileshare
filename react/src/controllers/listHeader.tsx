import { Row, Col, Button } from "react-bootstrap";
import { FormModal } from "./formModal";

type ListHeaderProps = {
  getSchema: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  setShowAdd: (show: boolean) => void;
  schema: unknown;
  serverError: unknown;
  showAdd: boolean;
  insertingData: boolean;
  viewRecord: unknown;
  clearViewRecord: () => void;
};

export const ListHeader = ({
  getSchema,
  onSubmit,
  setShowAdd,
  schema,
  serverError,
  showAdd,
  insertingData,
  viewRecord,
  clearViewRecord,
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
            clearViewRecord();
            setShowAdd(true);
            getSchema();
          }}
        >
          Add user
        </Button>
      </Col>
      <FormModal
        setShow={setShowAdd}
        onSubmit={onSubmit}
        show={showAdd}
        schema={schema}
        serverError={serverError}
        disabled={insertingData}
        viewRecord={viewRecord}
      />
    </Row>
  );
};

export default ListHeader;
