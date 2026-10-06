import { Row, Col, Button } from "react-bootstrap";
import { useState } from "react";
import { AddModal } from "./addModal";

export const ListHeader = ({ getSchema, schema, onSubmit, serverError }) => {
  const [show, setShow] = useState(false);
  return (
    <Row>
      <Col>
        <h3>This is a Bootstrap Heading</h3>
      </Col>
      <Col className="text-end">
        <Button
          variant="primary"
          onClick={() => {
            (setShow(true), getSchema());
          }}
        >
          Add user
        </Button>
      </Col>
      <AddModal
        show={show}
        setShow={setShow}
        schema={schema}
        onSubmit={onSubmit}
        serverError={serverError}
      />
    </Row>
  );
};

export default ListHeader;
