import { Row, Col, Button } from "react-bootstrap";
import { FormModal } from "./formModal";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type ListHeaderProps = {
  onSubmit: (payload: Record<string, unknown>) => void;
  setShowAdd: (show: boolean) => void;
  clearServerError: () => void;
  pages: PageConfig;
  schema: unknown;
  serverError: unknown;
  showAdd: boolean;
  insertingData: boolean;
  viewRecord: unknown;
  clearViewRecord: () => void;
};

export const ListHeader = ({
  onSubmit,
  setShowAdd,
  clearServerError,
  pages,
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
        <h3>{getPageText(pages, "heading")}</h3>
      </Col>
      <Col className="text-end">
        <Button
          variant="primary"
          onClick={() => {
            clearViewRecord();
            setShowAdd(true);
          }}
        >
          {getPageText(pages, "addButton")}
        </Button>
      </Col>
      <FormModal
        setShow={setShowAdd}
        onSubmit={onSubmit}
        show={showAdd}
        schema={schema}
        pages={pages}
        serverError={serverError}
        clearServerError={clearServerError}
        disabled={insertingData}
        viewRecord={viewRecord}
      />
    </Row>
  );
};

export default ListHeader;
