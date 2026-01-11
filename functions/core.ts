export type ResponseData<T> = {
  type: "data" | "error";
  message?: string;
  payload: T;
  status?: number;
};

class ResponseWrappeer {
  json<T>(payload: T, status: number = 200, message?: string): ResponseData<T> {
    return { type: "data", payload, status, message };
  }

  error<T>(
    payload: T,
    status: number = 500,
    message?: string
  ): ResponseData<T> {
    return { type: "error", payload, status, message };
  }
}

const Response = new ResponseWrappeer();

export { Response };
