import { Row, Col, Button, Form, InputGroup, Collapse } from "react-bootstrap";
import { FormModal } from "./formModal";
import { getPageText, type PageConfig } from "../utils/pageConfig";
import { useId, useState } from "react";
import { BsFunnel, BsSearch } from "react-icons/bs";

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
  filterValues: Record<string, string>;
  onFilterChange: (field: string, value: string) => void;
  onFilterSubmit: () => Promise<void>;
  onFilterClear: () => Promise<void>;
  closeFilterOnAction: boolean;
  applyingFilters: boolean;
  disableFilterControlsWhileApplying: boolean;
};

type FilterField = {
  name?: string;
  type?: string;
  operation?: string[];
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
  filterValues,
  onFilterChange,
  onFilterSubmit,
  onFilterClear,
  closeFilterOnAction,
  applyingFilters,
  disableFilterControlsWhileApplying,
}: ListHeaderProps) => {
  const addTooltipId = useId();
  const [showFilters, setShowFilters] = useState(false);
  const applyFilters = async () => {
    await onFilterSubmit();
    if (closeFilterOnAction) setShowFilters(false);
  };
  const clearFilters = async () => {
    await onFilterClear();
    if (closeFilterOnAction) setShowFilters(false);
  };

  const filterFields =
    schema && typeof schema === "object" && !Array.isArray(schema)
      ? Object.entries(schema as Record<string, FilterField>).filter(
          ([, field]) => field.operation?.includes("filter"),
        )
      : [];
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
        {!isLoading && (
          <>
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() => {
                setShowFilters((current) => !current);
              }}
              disabled={applyingFilters && disableFilterControlsWhileApplying}
              aria-expanded={showFilters}
            >
              <BsFunnel className="me-1" aria-hidden="true" />
              {getPageText(pages, "listFilterButton")}
            </Button>
            {pages.addButtonTooltip == null ? (
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
            )}
          </>
        )}
      </Col>
      <Col xs={12}>
        <Collapse in={showFilters}>
          <div className="border rounded p-3 mt-2">
            <h5>{getPageText(pages, "listFilterTitle")}</h5>
            <Row>
              {filterFields.map(([key, field]) => (
                <Col xs={12} md={4} key={key} className="mb-3">
                  <Form.Label htmlFor={`filter-${key}`}>
                    {field.name ?? key}
                  </Form.Label>
                  <Form.Control
                    id={`filter-${key}`}
                    type={field.type === "Date" ? "date" : "text"}
                    value={filterValues[key] ?? ""}
                    disabled={
                      applyingFilters && disableFilterControlsWhileApplying
                    }
                    onChange={(event) =>
                      onFilterChange(key, event.target.value)
                    }
                  />
                </Col>
              ))}
            </Row>
            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="outline-secondary"
                disabled={applyingFilters && disableFilterControlsWhileApplying}
                onClick={() => {
                  void clearFilters();
                }}
              >
                {getPageText(pages, "listFilterClearButton")}
              </Button>
              <Button
                variant="primary"
                disabled={applyingFilters && disableFilterControlsWhileApplying}
                onClick={() => {
                  void applyFilters();
                }}
              >
                {getPageText(
                  pages,
                  applyingFilters
                    ? "listFilterApplyingButton"
                    : "listFilterApplyButton",
                )}
              </Button>
            </div>
          </div>
        </Collapse>
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
