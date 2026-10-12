import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type RegisterOptions } from "react-hook-form";
import {
  getPageText,
  getPageVariant,
  isPageConfig,
  type PageConfig,
} from "../utils/pageConfig";
import { Loading } from "../controllers/loading";

const HOSTNAME = "http://localhost:3000/";

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

type LoginConfig = {
  schema: Record<string, SchemaField>;
  pages: PageConfig;
};

const loginConfigRequests = new Map<string, Promise<LoginConfig>>();

const loadLoginConfig = (collection: string): Promise<LoginConfig> => {
  const existingRequest = loginConfigRequests.get(collection);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const response = await fetch(`${HOSTNAME}${collection}/schema`);
    const data: unknown = await response.json();
    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Unable to load login form."));
    }
    if (
      typeof data !== "object" ||
      data === null ||
      Array.isArray(data) ||
      !("schema" in data) ||
      typeof data.schema !== "object" ||
      data.schema === null ||
      Array.isArray(data.schema) ||
      !("pages" in data) ||
      !isPageConfig(data.pages)
    ) {
      throw new Error("Invalid login form configuration.");
    }
    return {
      schema: data.schema as Record<string, SchemaField>,
      pages: data.pages,
    };
  })();

  loginConfigRequests.set(collection, request);
  void request.catch(() => {
    if (loginConfigRequests.get(collection) === request) {
      loginConfigRequests.delete(collection);
    }
  });
  return request;
};

const getErrorMessage = (value: unknown, fallback: string): string =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  "error" in value &&
  typeof value.error === "string"
    ? value.error
    : fallback;

const getPattern = (key: string | undefined): RegExp | undefined => {
  switch (key) {
    case "EMAIL":
      return /^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)+$/;
    case "ALPHA":
      return /^[a-zA-Z\s]+$/;
    case "PASSWORD":
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    default:
      return undefined;
  }
};

const getFieldRules = (
  field: SchemaField,
): RegisterOptions<Record<string, string>> => ({
  required: field.required?.[1] || undefined,
  pattern: field.match?.[0]
    ? {
        value: getPattern(field.match[0]) ?? /.*/,
        message: field.match[1] || "",
      }
    : undefined,
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

const getAlignmentClasses = (
  alignment: string,
): { card: string; buttons: string } => {
  if (alignment === "left") {
    return { card: "me-auto", buttons: "justify-content-start" };
  }
  if (alignment === "right") {
    return { card: "ms-auto", buttons: "justify-content-end" };
  }
  return { card: "mx-auto", buttons: "justify-content-center" };
};

export const Login = () => {
  const { one: collection } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState<LoginConfig>();
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [schemaError, setSchemaError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>();

  useEffect(() => {
    let active = true;
    const loadSchema = async () => {
      setLoadingSchema(true);
      setSchemaError("");
      try {
        if (!collection) throw new Error("Login collection is missing.");
        const loginConfig = await loadLoginConfig(collection);
        if (active) {
          setConfig(loginConfig);
          if (
            localStorage.getItem("authToken") &&
            localStorage.getItem("_id")
          ) {
            const redirectPath =
              getPageText(loginConfig.pages, "loginRedirectPath") ||
              `/${collection}`;
            void navigate(redirectPath, { replace: true });
          }
        }
      } catch (error) {
        if (active) {
          setSchemaError(
            error instanceof Error ? error.message : String(error),
          );
        }
      } finally {
        if (active) setLoadingSchema(false);
      }
    };
    void loadSchema();
    return () => {
      active = false;
    };
  }, [collection, navigate]);

  const submitLogin = async (credentials: Record<string, string>) => {
    if (!collection || !config) return;
    setSubmitting(true);
    setServerError("");
    try {
      const response = await fetch(`${HOSTNAME}${collection}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            getPageText(config.pages, "loginFailureMessage"),
          ),
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("authToken" in data) ||
        typeof data.authToken !== "string" ||
        data.authToken.length === 0 ||
        !("_id" in data) ||
        typeof data._id !== "string" ||
        data._id.length === 0
      ) {
        throw new Error(
          getPageText(config.pages, "loginFailureMessage") ||
            "Login response is missing authentication details.",
        );
      }

      localStorage.setItem("authToken", data.authToken);
      localStorage.setItem("_id", data._id);
      const redirectPath =
        getPageText(config.pages, "loginRedirectPath") || `/${collection}`;
      await navigate(redirectPath);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  const pages = config?.pages ?? {};
  const loginFields = Object.entries(config?.schema ?? {}).filter(
    ([, field]) => field.operation?.includes("login"),
  );
  const alignment = getPageText(pages, "loginAlignment");
  const alignmentClasses = getAlignmentClasses(alignment);
  const configuredCardWidth = pages.loginCardMaxWidth;
  const cardMaxWidth =
    typeof configuredCardWidth === "number" && configuredCardWidth > 0
      ? configuredCardWidth
      : 440;
  let formContent;
  if (loadingSchema) {
    formContent = <Loading pages={pages} />;
  } else if (schemaError) {
    formContent = (
      <Alert variant="danger" role="alert">
        {schemaError}
      </Alert>
    );
  } else {
    formContent = (
      <Form onSubmit={handleSubmit(submitLogin)}>
        {serverError && (
          <Alert variant="danger" role="alert">
            {serverError}
          </Alert>
        )}
        {loginFields.map(([key, field]) => (
          <Form.Group className="mb-3" controlId={`login-${key}`} key={key}>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control
              type={field.inputType ?? "text"}
              placeholder={field.placeHolder}
              isInvalid={Boolean(errors[key])}
              disabled={submitting}
              {...register(key, getFieldRules(field))}
            />
            <Form.Control.Feedback type="invalid">
              {errors[key]?.message}
            </Form.Control.Feedback>
          </Form.Group>
        ))}
        <div className={`d-flex ${alignmentClasses.buttons}`}>
          <Button
            type="submit"
            variant={getPageVariant(pages, "loginSubmitButtonVariant", "primary")}
            disabled={submitting || loginFields.length === 0}
          >
            {submitting && (
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
                aria-hidden="true"
              />
            )}
            {getPageText(
              pages,
              submitting ? "loginLoadingButton" : "loginSubmitButton",
            )}
          </Button>
        </div>
      </Form>
    );
  }

  return (
    <Container className="py-5">
      <Card
        className={`shadow-sm ${alignmentClasses.card}`}
        style={{ maxWidth: cardMaxWidth }}
      >
        <Card.Header as="h1" className="fs-4 mb-0">
          {getPageText(pages, "loginTitle")}
        </Card.Header>
        <Card.Body>
          {formContent}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
