import { Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { FormModal } from "./formModal";
import { getPageText, type PageConfig } from "../utils/pageConfig";
import { useId } from "react";
import { BsSearch } from "react-icons/bs";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

type ListHeaderProps = {
  onSubmit: (payload: Record<string, unknown>) => void;
  setShowAdd: (show: boolean) => void;
  clearServerError: () => void;
  pages: PageConfig;
  schema: unknown;
  serverError: unknown;
  showAdd: boolean;
  insertingData: boolean;
  loadingRecord: boolean;
  isLoading: boolean;
  viewRecord: unknown;
  clearViewRecord: () => void;
  search: string;
  onSearch: (value: string) => void;
  onSearchSubmit: () => void;
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
  loadingRecord,
  isLoading,
  viewRecord,
  clearViewRecord,
  search,
  onSearch,
  onSearchSubmit,
}: ListHeaderProps) => {
  const addTooltipId = useId();
  const addButton = (
    <Button
      variant="primary"
      onClick={() => {
        clearViewRecord();
        setShowAdd(true);
      }}
    >
      {getPageText(pages, "addButton")}
    </Button>
  );

  return (
    <Row>
      <Col>
        <h3>{getPageText(pages, "heading")}</h3>
      </Col>
      <Col xs={12} md={5}>
        <InputGroup>
          <Form.Control
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearchSubmit();
              }
            }}
            placeholder={getPageText(pages, "listSearchPlaceholder")}
            aria-label={getPageText(pages, "listSearchPlaceholder")}
          />
          <Button
            variant="outline-secondary"
            onClick={onSearchSubmit}
            aria-label={getPageText(pages, "listSearchButton")}
            title={getPageText(pages, "listSearchButton")}
          >
            <BsSearch aria-hidden="true" />
          </Button>
        </InputGroup>
      </Col>
      <Col className="text-end">
        {!isLoading &&
          (pages.addButtonTooltip == null ? (
            addButton
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={addTooltipId}>
                  {getPageText(pages, "addButtonTooltip")}
                </Tooltip>
              }
            >
              {addButton}
            </OverlayTrigger>
          ))}
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
        loadingRecord={loadingRecord}
        viewRecord={viewRecord}
      />
    </Row>
  );
};

export default ListHeader;
