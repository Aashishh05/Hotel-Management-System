import Guest from "../model/guestModel.js";

const createGuest = async (guestData) => {
  return await Guest.create(guestData);
};

const getAllGuests = async () => {
  return await Guest.find().sort({ createdAt: -1 });
};

const getAllGuestsWithPagination = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [guests, total] = await Promise.all([
    Guest.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Guest.countDocuments(),
  ]);
  return {
    guests,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getGuestById = async (id) => {
  return await Guest.findById(id);
};

const getGuestByEmail = async (email) => {
  return await Guest.findOne({ email });
};

const getGuestByPhone = async (phone) => {
  return await Guest.findOne({ phone });
};

const getGuestByIdNumber = async (idNumber) => {
  return await Guest.findOne({ idNumber });
};

const updateGuest = async (id, guestData) => {
  return await Guest.findByIdAndUpdate(id, guestData, {
    new: true,
    runValidators: true,
  });
};

const deleteGuest = async (id) => {
  return await Guest.findByIdAndDelete(id);
};

export default {
  createGuest,
  getAllGuests,
  getAllGuestsWithPagination,
  getGuestById,
  getGuestByEmail,
  getGuestByPhone,
  getGuestByIdNumber,
  updateGuest,
  deleteGuest,
};
