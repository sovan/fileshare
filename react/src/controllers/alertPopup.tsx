import Alert from "react-bootstrap/Alert";
import type { LocalAlert } from "../hooks/useAPI";

export const AlertPopup = (LocalAlert: LocalAlert[]) => {
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999999999999,
        }}
      >
        {LocalAlert.map((alert) => (
          <Alert key={alert.id} variant={alert.type}>
            {alert.message}
          </Alert>
        ))}
      </div>
    </div>
  );
};
