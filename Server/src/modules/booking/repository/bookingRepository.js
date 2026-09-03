import Booking from "../model/bookingModel.js";

const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

const getAllBookings = async () => {
  return await Booking.find()
    .populate("guest")
    .populate("room")
    .populate("bookedBy");
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
  getBookingById,
  getBookingsByGuest,
  getBookingsByRoom,
  getBookingsByStatus,
  findOverlappingBooking,
  updateBooking,
  deleteBooking,
};
