import Booking from "../model/bookingModel.js";

const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

const getAllBookings = async () => {
  return await Booking.find()
    .populate("guest")
    .populate("room")
    .populate("bookedBy")
    .sort({ createdAt: -1 });
};

const getAllBookingsWithPagination = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find()
      .populate("guest")
      .populate("room")
      .populate("bookedBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(),
  ]);
  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getBookingById = async (id) => {
  return await Booking.findById(id)
    .populate("guest")
    .populate("room")
    .populate("bookedBy");
};

const getBookingsByGuest = async (guestId) => {
  return await Booking.find({ guest: guestId })
    .populate("guest")
    .populate("room")
    .populate("bookedBy");
};

const getBookingsByRoom = async (roomId) => {
  return await Booking.find({ room: roomId })
    .populate("guest")
    .populate("room")
    .populate("bookedBy");
};

const getBookingsByStatus = async (status) => {
  return await Booking.find({ status })
    .populate("guest")
    .populate("room")
    .populate("bookedBy");
};

const findOverlappingBooking = async (
  roomId,
  checkInDate,
  checkOutDate,
  excludeBookingId = null,
) => {
  const query = {
    room: roomId,

    status: {
      $nin: ["cancelled", "checked-out"],
    },

    checkInDate: {
      $lt: checkOutDate,
    },

    checkOutDate: {
      $gt: checkInDate,
    },
  };

  if (excludeBookingId) {
    query._id = {
      $ne: excludeBookingId,
    };
  }

  return await Booking.findOne(query);
};

const findActiveGuestRoomBooking = async (guestId, roomId) => {
  return await Booking.findOne({
    guest: guestId,
    room: roomId,
    status: {
      $in: ["pending", "confirmed", "checked-in"],
    },
  });
};

const findActiveGuestBooking = async (guestId) => {
  return await Booking.findOne({
    guest: guestId,
    status: {
      $in: ["pending", "confirmed", "checked-in"],
    },
  })
    .populate("room")
    .sort({ createdAt: -1 });
};

const updateBooking = async (id, bookingData) => {
  return await Booking.findByIdAndUpdate(id, bookingData, {
    new: true,
    runValidators: true,
  })
    .populate("guest")
    .populate("room")
    .populate("bookedBy");
};

const deleteBooking = async (id) => {
  return await Booking.findByIdAndDelete(id);
};

export default {
  createBooking,
  getAllBookings,
  getAllBookingsWithPagination,
  getBookingById,
  getBookingsByGuest,
  getBookingsByRoom,
  getBookingsByStatus,
  findOverlappingBooking,
  updateBooking,
  deleteBooking,
};
