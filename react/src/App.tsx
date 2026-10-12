import { BrowserRouter } from "react-router-dom";
import HeaderPanel from "./headerPanel";
import Router from "./router.tsx";
import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:3000/";
let stylesheetLoadPromise: Promise<void> | undefined;

const isStylesheetConfig = (value: unknown): value is { stylesheets: string[] } =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  "stylesheets" in value &&
  Array.isArray(value.stylesheets) &&
  value.stylesheets.length > 0 &&
  value.stylesheets.every(
    (stylesheet) => typeof stylesheet === "string" && stylesheet.length > 0,
  );

const loadConfiguredStylesheets = (): Promise<void> => {
  if (!stylesheetLoadPromise) {
    stylesheetLoadPromise = (async () => {
      const response = await fetch(`${BACKEND_URL}config`);
      if (!response.ok) {
        throw new Error(
          `Unable to load application config (${response.status}).`,
        );
      }
      const data: unknown = await response.json();
      if (!isStylesheetConfig(data)) {
        throw new Error("Invalid application stylesheet configuration.");
      }

      const stylesheetLinks = data.stylesheets.map((stylesheet) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL(stylesheet, BACKEND_URL).href;
        document.head.append(link);
        return { link, stylesheet };
      });

      try {
        await Promise.all(
          stylesheetLinks.map(
            ({ link, stylesheet }) =>
              new Promise<void>((resolve, reject) => {
                link.onload = () => resolve();
                link.onerror = () =>
                  reject(
                    new Error(`Unable to load stylesheet: ${stylesheet}`),
                  );
              }),
          ),
        );
      } catch (error) {
        stylesheetLinks.forEach(({ link }) => link.remove());
        throw error;
      }
    })();
  }
  return stylesheetLoadPromise;
};

export const App = () => {
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [styleError, setStyleError] = useState("");

  useEffect(() => {
    let active = true;
    void loadConfiguredStylesheets()
      .then(() => {
        if (active) setStylesLoaded(true);
      })
      .catch((error: unknown) => {
        if (active) {
          setStyleError(
            error instanceof Error ? error.message : String(error),
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (styleError) {
    return <div role="alert">{styleError}</div>;
  }
  if (!stylesLoaded) {
    return <div role="status">Loading application styles...</div>;
  }

  return (
    <BrowserRouter>
      <HeaderPanel />
      <Container className="py-1 py-md-4">
        <Router />
      </Container>
    </BrowserRouter>
  );
};

export default App;
