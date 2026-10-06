import { Button, Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

export const AddModal = ({ show, setShow, schema, onSubmit, serverError }) => {
  const schemaKeys = Object.keys(schema);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const getPattern = (key) => {
    switch (key) {
      case "EMAIL":
        return /\S+@\S+\.\S+/;
      case "ALPHA":
        return /^[a-zA-Z\s]+$/;
      case "PASSWORD":
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      default:
        return "";
    }
  };

  const createInputBox = (schema, errors, key, serverError) => {
    return (
      <Form.Group
        key={key}
        className="mb-3"
        controlId="exampleForm.ControlInput1"
      >
        <Form.Label>{schema?.name}</Form.Label>

        {(schema?.inputType === "text" || schema?.inputType === "password") && (
          <Form.Control
            placeholder={schema?.placeHolder}
            type={schema?.inputType}
            {...register(key, {
              required: schema?.required?.[1] || undefined,
              pattern: schema?.match
                ? {
                    value: getPattern(schema?.match?.[0]),
                    message: schema?.match?.[1] || undefined,
                  }
                : undefined,
              minLength: schema?.minLength
                ? {
                    value: schema?.minLength?.[0],
                    message: schema?.minLength?.[1].replace(
                      "{MINLENGTH}",
                      schema?.minLength?.[0],
                    ),
                  }
                : undefined,
              maxLength: schema?.maxLength
                ? {
                    value: schema?.maxLength?.[0],
                    message: schema?.maxLength?.[1].replace(
                      "{MAXLENGTH}",
                      schema?.maxLength?.[0],
                    ),
                  }
                : undefined,
            })}
          />
        )}
        {errors && <p style={{ color: "red" }}>{errors?.message}</p>}
        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
      </Form.Group>
    );
  };

  return (
    <Modal show={show} onHide={() => setShow(false)} centered backdrop="static">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Add a user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {schemaKeys.map((key) => {
            {
              const eachSchema = schema[key];
              const eachError = errors[key];
              return eachSchema?.operation &&
                eachSchema?.operation.includes("add")
                ? createInputBox(eachSchema, eachError, key, serverError?.[key])
                : null;
            }
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
          <Button type="submit">Save Changes</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddModal;
