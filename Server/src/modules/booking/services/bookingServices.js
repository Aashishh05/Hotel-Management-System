import guestRepository from "../../../modules/guest/repository/guestRepository.js";
import roomRepository from "../../../modules/room/repository/roomRepository.js";
import userRepository from "../../../modules/user/repository/userRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import bookingRepository from "../repository/bookingRepository.js";

const GUEST_ROLE = "guest";

const getActor = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new ErrorHandler("Booking user not found", 404);
  }

  return user;
};

const isGuestRole = (user) => user?.role?.name === GUEST_ROLE;

const resolveGuestForUser = async (user) => {
  if (!user?.email) return null;
  return await guestRepository.getGuestByEmail(user.email);
};

const ensureOwnGuest = async (user) => {
  const existing = await resolveGuestForUser(user);

  if (existing) {
    return existing;
  }

  return await guestRepository.createGuest({
    name: user.name,
    email: user.email,
  });
};

const getOwnBookings = async (userId) => {
  const actor = await getActor(userId);
  const ownGuest = await resolveGuestForUser(actor);

  if (!ownGuest) {
    return [];
  }

  return await bookingRepository.getBookingsByGuest(ownGuest._id);
};

const bookingOwnedByUser = (booking, user) => {
  const ownGuestId = String(user?._id || "");
  const bookingGuestId = String(booking?.guest?._id || "");

  return ownGuestId && bookingGuestId === ownGuestId;
};

const createBooking = async (bookingData, userId) => {
  const {
    guest,
    room,
    checkInDate,
    checkOutDate,
    totalAmount,
    specialRequests,
    guestsCount,
    idType,
    idNumber,
    guestPhone,
    status,
  } = bookingData;

  const actor = await getActor(userId);

  let guestId = guest;
  let bookingStatus = status || "pending";

  if (isGuestRole(actor)) {
    const ownGuest = await ensureOwnGuest(actor);
    guestId = ownGuest._id;
    bookingStatus = "pending";

    const phone = guestPhone?.trim();

    if (!phone) {
      throw new ErrorHandler("Phone number is required", 400);
    }

    const guestUpdates = { phone };

    if (idType) {
      if (!idNumber?.trim()) {
        throw new ErrorHandler(
          "ID number is required when ID type is selected",
          400,
        );
      }

      guestUpdates.idType = idType;
      guestUpdates.idNumber = idNumber.trim();
    }

    await guestRepository.updateGuest(ownGuest._id, guestUpdates);
  } else {
    const existingGuest = await guestRepository.getGuestById(guestId);

    if (!existingGuest) {
      throw new ErrorHandler("Guest not found", 404);
    }
  }

  const existingRoom = await roomRepository.getRoomById(room);

  if (!existingRoom) {
    throw new ErrorHandler("Room not found", 404);
  }

  const overlappingBooking = await bookingRepository.findOverlappingBooking(
    room,
    checkInDate,
    checkOutDate,
  );

  if (overlappingBooking) {
    throw new ErrorHandler("Room is already booked for the selected dates", 409);
  }

  return await bookingRepository.createBooking({
    guest: guestId,
    room,
    checkInDate,
    checkOutDate,
    totalAmount,
    specialRequests,
    guestsCount,
    status: bookingStatus,
    bookedBy: userId || null,
  });
};

const getAllBookings = async (userId) => {
  if (isGuestRole(await getActor(userId))) {
    return await getOwnBookings(userId);
  }

  return await bookingRepository.getAllBookings();
};

const getBookingById = async (id, userId) => {
  const booking = await bookingRepository.getBookingById(id);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  const actor = await getActor(userId);

  if (isGuestRole(actor) && !bookingOwnedByUser(booking, await resolveGuestForUser(actor))) {
    throw new ErrorHandler("Booking not found", 404);
  }

  return booking;
};

const getBookingsByGuest = async (guestId, userId) => {
  const guest = await guestRepository.getGuestById(guestId);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  const actor = await getActor(userId);

  if (isGuestRole(actor)) {
    const ownGuest = await resolveGuestForUser(actor);

    if (!ownGuest || String(ownGuest._id) !== guestId) {
      throw new ErrorHandler("Guest not found", 404);
    }

    return await bookingRepository.getBookingsByGuest(ownGuest._id);
  }

  return await bookingRepository.getBookingsByGuest(guestId);
};

const getBookingsByRoom = async (roomId, userId) => {
  if (isGuestRole(await getActor(userId))) {
    return await getOwnBookings(userId);
  }

  const room = await roomRepository.getRoomById(roomId);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  return await bookingRepository.getBookingsByRoom(roomId);
};

const getBookingsByStatus = async (status, userId) => {
  if (isGuestRole(await getActor(userId))) {
    return await getOwnBookings(userId);
  }

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

const confirmBooking = async (bookingId, userId) => {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  if (isGuestRole(await getActor(userId))) {
    throw new ErrorHandler("Only staff can confirm bookings", 403);
  }

  if (booking.status !== "pending") {
    throw new ErrorHandler("Only pending bookings can be confirmed", 400);
  }

  return await bookingRepository.updateBooking(bookingId, {
    status: "confirmed",
  });
};

const updateBooking = async (id, bookingData, userId) => {
  const booking = await bookingRepository.getBookingById(id);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  const actor = await getActor(userId);

  if (isGuestRole(actor)) {
    const ownGuest = await resolveGuestForUser(actor);

    if (!bookingOwnedByUser(booking, ownGuest)) {
      throw new ErrorHandler("Booking not found", 404);
    }

    if (bookingData.status !== "cancelled") {
      throw new ErrorHandler("Guests can only cancel their own bookings", 403);
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      throw new ErrorHandler(
        "Only pending or confirmed bookings can be cancelled",
        400,
      );
    }

    return await bookingRepository.updateBooking(id, { status: "cancelled" });
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
      throw new ErrorHandler("Room is already booked for the selected dates", 409);
    }
  }

  return await bookingRepository.updateBooking(id, bookingData);
};

const deleteBooking = async (id, userId) => {
  const booking = await bookingRepository.getBookingById(id);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  if (isGuestRole(await getActor(userId))) {
    throw new ErrorHandler("Only staff can delete bookings", 403);
  }

  if (booking.status === "checked-in" || booking.status === "checked-out") {
    throw new ErrorHandler(
      "Checked-in or checked-out bookings cannot be deleted",
      400,
    );
  }

  return await bookingRepository.deleteBooking(id);
};

const checkInBooking = async (bookingId, userId) => {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  if (isGuestRole(await getActor(userId))) {
    throw new ErrorHandler("Only staff can check in bookings", 403);
  }

  if (booking.status !== "confirmed") {
    throw new ErrorHandler("Only confirmed bookings can be checked in", 400);
  }

  const room = await roomRepository.getRoomById(booking.room._id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  if (room.status !== "available") {
    throw new ErrorHandler("Room is not available for check-in", 400);
  }

  const updatedBooking = await bookingRepository.updateBooking(bookingId, {
    status: "checked-in",
    actualCheckIn: new Date(),
  });

  await roomRepository.updateRoom(booking.room._id, {
    status: "occupied",
  });

  return updatedBooking;
};

const checkOutBooking = async (bookingId, userId) => {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  if (isGuestRole(await getActor(userId))) {
    throw new ErrorHandler("Only staff can check out bookings", 403);
  }

  if (booking.status !== "checked-in") {
    throw new ErrorHandler("Only checked-in bookings can be checked out", 400);
  }

  const room = await roomRepository.getRoomById(booking.room._id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  const updatedBooking = await bookingRepository.updateBooking(bookingId, {
    status: "checked-out",
    actualCheckOut: new Date(),
  });

  await roomRepository.updateRoom(booking.room._id, {
    status: "available",
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
  confirmBooking,
  updateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
};