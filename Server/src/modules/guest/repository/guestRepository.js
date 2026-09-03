import Guest from "../model/guestModel.js";

const createGuest = async (guestData) => {
  return await Guest.create(guestData);
};

const getAllGuests = async () => {
  return await Guest.find();
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
  return await Guest.findOne(idNumber);
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
  getGuestByEmail,
  getGuestById,
  getGuestByIdNumber,
  getGuestByPhone,
  updateGuest,
  deleteGuest,
};
