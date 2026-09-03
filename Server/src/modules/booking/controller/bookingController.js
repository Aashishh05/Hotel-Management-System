import bookingServices from "../services/bookingServices.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";

export const createBooking = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.createBooking(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    booking,
  });
});

export const getAllBookings = asyncErrorHandler(async (req, res) => {
  const bookings = await bookingServices.getAllBookings();

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const getBookingById = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.getBookingById(req.params.id);

  res.status(200).json({
    success: true,
    booking,
  });
});

export const getBookingsByGuest = asyncErrorHandler(async (req, res) => {
  const bookings = await bookingServices.getBookingsByGuest(req.params.guestId);

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const getBookingsByRoom = asyncErrorHandler(async (req, res) => {
  const bookings = await bookingServices.getBookingsByRoom(req.params.roomId);

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const getBookingsByStatus = asyncErrorHandler(async (req, res) => {
  const bookings = await bookingServices.getBookingsByStatus(req.params.status);

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const updateBooking = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.updateBooking(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Booking updated successfully",
    booking,
  });
});

export const deleteBooking = asyncErrorHandler(async (req, res) => {
  await bookingServices.deleteBooking(req.params.id);

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
  });
});

