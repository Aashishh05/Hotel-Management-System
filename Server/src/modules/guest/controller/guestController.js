import guestServices from "../services/guestServices.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";

export const createGuest = asyncErrorHandler(async (req, res) => {
  const guest = await guestServices.createGuest(req.body, req.user?._id);

  res.status(201).json({
    success: true,
    message: "Guest created successfully",
    guest,
  });
});

export const getAllGuests = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await guestServices.getAllGuests({
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getGuestById = asyncErrorHandler(async (req, res) => {
  const guest = await guestServices.getGuestById(req.params.id);

  res.status(200).json({
    success: true,
    guest,
  });
});

export const updateGuest = asyncErrorHandler(async (req, res) => {
  const guest = await guestServices.updateGuest(
    req.params.id,
    req.body,
    req.user?._id,
  );

  res.status(200).json({
    success: true,
    message: "Guest updated successfully",
    guest,
  });
});

export const deleteGuest = asyncErrorHandler(async (req, res) => {
  await guestServices.deleteGuest(req.params.id, req.user?._id);

  res.status(200).json({
    success: true,
    message: "Guest deleted successfully",
  });
});
