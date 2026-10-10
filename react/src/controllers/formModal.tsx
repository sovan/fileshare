import { Button, Modal, Form } from "react-bootstrap";
import { useEffect } from "react";
import { useForm, type FieldError } from "react-hook-form";

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
  onSubmit: (payload: Record<string, unknown>) => unknown;
  show: boolean;
  schema: unknown;
  serverError: unknown;
  disabled: boolean;
  viewRecord: unknown;
};

const toFormValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return JSON.stringify(value) ?? "";
};

export const FormModal = ({
  setShow,
  onSubmit,
  show,
  schema,
  serverError,
  disabled,
  viewRecord,
}: FormModalProps) => {
  const schemaFields =
    schema && typeof schema === "object"
      ? (schema as Record<string, SchemaField>)
      : {};
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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
    const values = Object.fromEntries(
      Object.entries(record).map(([key, value]) => [key, toFormValue(value)]),
    );
    reset(values);
  }, [reset, viewRecord]);

  const getPattern = (key: string | undefined): RegExp => {
    switch (key) {
      case "EMAIL":
        return /^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)+$/;
      case "ALPHA":
        return /^[a-zA-Z\s]+$/;
      case "PASSWORD":
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      default:
        return /.*/;
    }
  };

  const createInputBox = (
    field: SchemaField,
    fieldError: FieldError | undefined,
    key: string,
    fieldServerError: unknown,
  ) => {
    return (
      <Form.Group
        key={key}
        className="mb-3"
        controlId="exampleForm.ControlInput1"
      >
        <Form.Label>{field.name}</Form.Label>

        {(field.inputType === "text" || field.inputType === "password") && (
          <Form.Control
            placeholder={field.placeHolder}
            type={field.inputType}
            {...register(key, {
              required: field.required?.[1] || undefined,
              pattern: {
                value: getPattern(field?.match?.[0]),
                message: field?.match?.[1] || "",
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
            })}
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
  };

  return (
    <Modal show={show} onHide={() => setShow(false)} centered backdrop="static">
      <Form onSubmit={handleData()}>
        <Modal.Header>
          <Modal.Title>Add a user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.entries(schemaFields).map(([key, field]) => {
            const fieldServerError =
              typeof serverError === "object" &&
              serverError !== null &&
              key in serverError
                ? (serverError as Record<string, unknown>)[key]
                : undefined;

            return field.operation?.includes("add")
              ? createInputBox(field, errors[key], key, fieldServerError)
              : null;
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShow(false)}
            disabled={disabled}
          >
            Close
          </Button>
          <Button type="submit" disabled={disabled}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FormModal;
