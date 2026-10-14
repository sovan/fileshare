import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useEffect } from "react";
import {
  useForm,
  type FieldError,
  type RegisterOptions,
  type UseFormRegister,
} from "react-hook-form";
import {
  getModalButtonAlignmentClass,
  getPageText,
  getPageVariant,
  type PageConfig,
} from "../utils/pageConfig";
import { Loading } from "./loading";

type SchemaField = {
  name?: string;
  inputType?: string;
  placeHolder?: string;
  operation?: string[];
  required?: [boolean, string];
  match?: [string, string];
  minLength?: [number, string];
  maxLength?: [number, string];
};

type FormModalProps = {
  setShow: (show: boolean) => void;
  clearServerError: () => void;
  onSubmit: (payload: Record<string, unknown>) => unknown;
  show: boolean;
  schema: unknown;
  pages: PageConfig;
  serverError: unknown;
  disabled: boolean;
  loadingRecord: boolean;
  viewRecord: unknown;
};

const toFormValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return JSON.stringify(value) ?? "";
};

const getSchemaFields = (schema: unknown): Record<string, SchemaField> =>
  schema && typeof schema === "object" && !Array.isArray(schema)
    ? (schema as Record<string, SchemaField>)
    : {};

type SubmitButtonContentProps = {
  pages: PageConfig;
  isEditing: boolean;
  isSubmitting: boolean;
};

const SubmitButtonContent = ({
  pages,
  isEditing,
  isSubmitting,
}: SubmitButtonContentProps) => {
  if (isSubmitting) {
    return (
      <>
        <Spinner
          animation="border"
          size="sm"
          className="me-2"
          aria-hidden="true"
        />
        {getPageText(
          pages,
          isEditing ? "editSubmitLoadingButton" : "addSubmitLoadingButton",
        )}
      </>
    );
  }

  return getPageText(pages, isEditing ? "editSubmitButton" : "addSubmitButton");
};

const patterns: Record<string, RegExp> = {
  EMAIL: /^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)+$/,
  ALPHA: /^[a-zA-Z\s]+$/,
  ALPHABET: /^[a-zA-Z]+$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

const getPattern = (key: string | undefined): RegExp =>
  (key && patterns[key]) || /.*/;

const getFieldRules = (
  field: SchemaField,
): RegisterOptions<Record<string, string>> => ({
  required: field.required?.[1] || undefined,
  pattern: {
    value: getPattern(field.match?.[0]),
    message: field.match?.[1] || "",
  },
  minLength: field.minLength
    ? {
        value: field.minLength[0],
        message: field.minLength[1].replace(
          "{MINLENGTH}",
          String(field.minLength[0]),
        ),
      }
    : undefined,
  maxLength: field.maxLength
    ? {
        value: field.maxLength[0],
        message: field.maxLength[1].replace(
          "{MAXLENGTH}",
          String(field.maxLength[0]),
        ),
      }
    : undefined,
});

type FormFieldInputProps = {
  field: SchemaField;
  fieldError: FieldError | undefined;
  fieldServerError: unknown;
  name: string;
  register: UseFormRegister<Record<string, string>>;
};

const FormFieldInput = ({
  field,
  fieldError,
  fieldServerError,
  name,
  register,
}: FormFieldInputProps) => (
  <Form.Group className="mb-3" controlId={`form-field-${name}`}>
    <Form.Label>{field.name}</Form.Label>
    {(field.inputType === "text" || field.inputType === "password") && (
      <Form.Control
        placeholder={field.placeHolder}
        type={field.inputType}
        {...register(name, getFieldRules(field))}
      />
    )}
    {typeof fieldError?.message === "string" && (
      <p style={{ color: "red" }}>{fieldError.message}</p>
    )}
    {typeof fieldServerError === "string" && (
      <p style={{ color: "red" }}>{fieldServerError}</p>
    )}
  </Form.Group>
);

const getFieldServerError = (serverError: unknown, key: string): unknown => {
  if (
    typeof serverError === "object" &&
    serverError !== null &&
    key in serverError
  ) {
    return (serverError as Record<string, unknown>)[key];
  }
  return undefined;
};

export const FormModal = ({
  setShow,
  clearServerError,
  onSubmit,
  show,
  schema,
  pages,
  serverError,
  disabled,
  loadingRecord,
  viewRecord,
}: FormModalProps) => {
  const schemaFields = getSchemaFields(schema);
  const isEditing =
    viewRecord !== null &&
    typeof viewRecord === "object" &&
    !Array.isArray(viewRecord) &&
    "_id" in viewRecord &&
    typeof viewRecord._id === "string";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Record<string, string>>();

  const handleData = () =>
    handleSubmit(async (data) => {
      await onSubmit(data);
    });

  useEffect(() => {
    const record =
      viewRecord && typeof viewRecord === "object" && !Array.isArray(viewRecord)
        ? (viewRecord as Record<string, unknown>)
        : {};
    const fields =
      schema && typeof schema === "object" && !Array.isArray(schema)
        ? (schema as Record<string, SchemaField>)
        : {};
    const values = Object.fromEntries(
      Object.keys(fields)
        .filter((key) => key !== "_id")
        .map((key) => [key, toFormValue(record[key])]),
    );
    values._id = toFormValue(record._id);
    reset(values);
  }, [reset, schema, viewRecord]);

  useEffect(() => {
    if (!show) clearServerError();
  }, [clearServerError, show]);

  return (
    <Modal show={show} onHide={() => setShow(false)} centered backdrop="static">
      <Form
        onSubmit={
          loadingRecord ? (event) => event.preventDefault() : handleData()
        }
      >
        <Modal.Header>
          <Modal.Title>
            {getPageText(pages, isEditing ? "editTitle" : "addTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingRecord ? (
            <Loading pages={pages} />
          ) : (
            Object.entries(schemaFields)
              .filter(([, field]) => field.operation?.includes("add"))
              .map(([key, field]) => (
                <FormFieldInput
                  key={key}
                  field={field}
                  fieldError={errors[key]}
                  fieldServerError={getFieldServerError(serverError, key)}
                  name={key}
                  register={register}
                />
              ))
          )}
        </Modal.Body>
        <Modal.Footer
          className={getModalButtonAlignmentClass(
            pages,
            isEditing ? "editModalButtonAlignment" : "addModalButtonAlignment",
          )}
        >
          <Button
            variant={getPageVariant(
              pages,
              "formCancelButtonVariant",
              "secondary",
            )}
            onClick={() => setShow(false)}
            disabled={disabled || loadingRecord}
          >
            {getPageText(
              pages,
              isEditing ? "closeUpdateButton" : "closeAddButton",
            )}
          </Button>
          <Button
            type="submit"
            disabled={disabled || loadingRecord || (isEditing && !isDirty)}
          >
            <SubmitButtonContent
              pages={pages}
              isEditing={isEditing}
              isSubmitting={disabled}
            />
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FormModal;
