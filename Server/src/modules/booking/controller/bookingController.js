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
  const bookings = await bookingServices.getAllBookings(req.user._id);

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const getBookingById = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.getBookingById(
    req.params.id,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    booking,
  });
});

export const getBookingsByGuest = asyncErrorHandler(async (req, res) => {
  const bookings = await bookingServices.getBookingsByGuest(
    req.params.guestId,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const getBookingsByRoom = asyncErrorHandler(async (req, res) => {
  const bookings = await bookingServices.getBookingsByRoom(
    req.params.roomId,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const getBookingsByStatus = asyncErrorHandler(async (req, res) => {
  const bookings = await bookingServices.getBookingsByStatus(
    req.params.status,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    bookings,
  });
});

export const updateBooking = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.updateBooking(
    req.params.id,
    req.body,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Booking updated successfully",
    booking,
  });
});

export const confirmBooking = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.confirmBooking(
    req.params.id,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Booking confirmed successfully",
    booking,
  });
});

export const deleteBooking = asyncErrorHandler(async (req, res) => {
  await bookingServices.deleteBooking(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
  });
});

export const checkInBooking = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.checkInBooking(
    req.params.id,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Guest checked in successfully",
    booking,
  });
});

export const checkOutBooking = asyncErrorHandler(async (req, res) => {
  const booking = await bookingServices.checkOutBooking(
    req.params.id,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Guest checked out successfully",
    booking,
  });
});