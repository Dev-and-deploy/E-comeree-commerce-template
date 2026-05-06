export const success = (res, data, message = "Success", statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const created = (res, data, message = "Created") =>
  success(res, data, message, 201);

export const paginated = (res, data, pagination, message = "Success") =>
  res.status(200).json({ success: true, message, data, pagination });

export const noContent = (res) => res.status(204).send();
