import { AppError } from "../lib/AppError";
import { ErrorRequestHandler } from "express";

const specifyError = (error: Error) => {
  if (error.message === "jwt expired") {
    return "Token has expired";
  }

  return "Something went very wrong!";
};

export const errorHandler: ErrorRequestHandler = async (
  error: AppError | Error,
  request,
  response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).send({
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
      stack: error.stack,
    });

    return;
  }

  response.status(500).send({
    status: "fail",
    statusCode: 500,
    message: specifyError(error),
    stack: error.stack,
  });
};
