import guestRepository from "../../../modules/guest/repository/guestRepository.js";
import roomRepository from "../../../modules/room/repository/roomRepository.js";
import userRepository from "../../../modules/user/repository/userRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import bookingRepository from "../repository/bookingRepository.js";

const createBooking = async (bookingData, userId) => {
  const {
    guest,
    room,
    checkInDate,
    checkOutDate,
    totalAmount,
    specialRequests,
  } = bookingData;

  const existingGuest = await guestRepository.getGuestById(guest);

  if (!existingGuest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  const existingRoom = await roomRepository.getRoomById(room);

  if (!existingRoom) {
    throw new ErrorHandler("Room not found", 404);
  }

  // Check room availability for selected dates
  const overlappingBooking = await bookingRepository.findOverlappingBooking(
    room,
    checkInDate,
    checkOutDate,
  );

  if (overlappingBooking) {
    throw new ErrorHandler(
      "Room is already booked for the selected dates",
      409,
    );
  }

  // Validate bookedBy user if provided
  if (userId) {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new ErrorHandler("Booking user not found", 404);
    }
  }

  return await bookingRepository.createBooking({
    guest,
    room,
    checkInDate,
    checkOutDate,
    totalAmount,
    specialRequests,
    bookedBy: userId || null,
  });
};

const getAllBookings = async () => {
  return await bookingRepository.getAllBookings();
};

const getBookingById = async (id) => {
  const booking = await bookingRepository.getBookingById(id);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  return booking;
};

const getBookingsByGuest = async (guestId) => {
  const guest = await guestRepository.getGuestById(guestId);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  return await bookingRepository.getBookingsByGuest(guestId);
};

const getBookingsByRoom = async (roomId) => {
  const room = await roomRepository.getRoomById(roomId);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  return await bookingRepository.getBookingsByRoom(roomId);
};

const getBookingsByStatus = async (status) => {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "checked-in",
    "checked-out",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ErrorHandler("Invalid booking status", 400);
  }

  return await bookingRepository.getBookingsByStatus(status);
};

const updateBooking = async (id, bookingData) => {
  const booking = await bookingRepository.getBookingById(id);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  const guestId = bookingData.guest || booking.guest._id;
  const roomId = bookingData.room || booking.room._id;

  const checkInDate = bookingData.checkInDate || booking.checkInDate;

  const checkOutDate = bookingData.checkOutDate || booking.checkOutDate;

  if (bookingData.guest) {
    const guest = await guestRepository.getGuestById(bookingData.guest);

    if (!guest) {
      throw new ErrorHandler("Guest not found", 404);
    }
  }

  if (bookingData.room) {
    const room = await roomRepository.getRoomById(bookingData.room);

    if (!room) {
      throw new ErrorHandler("Room not found", 404);
    }
  }

  if (bookingData.room || bookingData.checkInDate || bookingData.checkOutDate) {
    const overlappingBooking = await bookingRepository.findOverlappingBooking(
      roomId,
      checkInDate,
      checkOutDate,
      id,
    );

    if (overlappingBooking) {
      throw new ErrorHandler(
        "Room is already booked for the selected dates",
        409,
      );
    }
  }

  return await bookingRepository.updateBooking(id, bookingData);
};

const deleteBooking = async (id) => {
  const booking = await bookingRepository.getBookingById(id);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  if (booking.status === "checked-in" || booking.status === "checked-out") {
    throw new ErrorHandler(
      "Checked-in or checked-out bookings cannot be deleted",
      400,
    );
  }

  return await bookingRepository.deleteBooking(id);
};

// Check-in booking
const checkInBooking = async (bookingId) => {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  // Only confirmed bookings can be checked in
  if (booking.status !== "confirmed") {
    throw new ErrorHandler("Only confirmed bookings can be checked in", 400);
  }

  const room = await roomRepository.getRoomById(booking.room._id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  // Room must be available
  if (room.status !== "available") {
    throw new ErrorHandler("Room is not available for check-in", 400);
  }

  // Update booking status and actual check-in time
  const updatedBooking = await bookingRepository.updateBooking(bookingId, {
    status: "checked-in",
    actualCheckIn: new Date(),
  });

  // Update room status
  await roomRepository.updateRoom(booking.room._id, {
    status: "occupied",
  });

  return updatedBooking;
};

// Check-out booking
const checkOutBooking = async (bookingId) => {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  // Only checked-in bookings can be checked out
  if (booking.status !== "checked-in") {
    throw new ErrorHandler("Only checked-in bookings can be checked out", 400);
  }

  const room = await roomRepository.getRoomById(booking.room._id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  // Update booking status and actual check-out time
  const updatedBooking = await bookingRepository.updateBooking(bookingId, {
    status: "checked-out",
    actualCheckOut: new Date(),
  });

  // Room needs cleaning after checkout
  await roomRepository.updateRoom(booking.room._id, {
    status: "cleaning",
  });

  return updatedBooking;
};

export default {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByGuest,
  getBookingsByRoom,
  getBookingsByStatus,
  updateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
};
