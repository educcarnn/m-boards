import React from "react";
import { Alert } from "antd";

type Props = {
  title?: string;
  error: unknown;
};

export const ErrorMessage: React.FC<Props> = ({ title = "Erro", error }) => {
  const description =
    error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

  return <Alert type="error" showIcon message={title} description={description} />;
};
