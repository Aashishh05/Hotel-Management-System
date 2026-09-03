import ErrorHandler from "../../../utils/ErrorHandler.js";
import guestRepository from "../repository/guestRepository.js";

const createGuest = async (guestData) => {
  const { email, phone, idNumber } = guestData;

  if (email) {
    const existingEmail = await guestRepository.getGuestByEmail(email);

    if (existingEmail) {
      throw new ErrorHandler("Guest with this emaiil already exists", 409);
    }
  }

  if (phone) {
    const existingPhone = await guestRepository.getGuestByPhone(phone);

    if (existingPhone) {
      throw new ErrorHandler(
        "Guest with this phone number already exists",
        409,
      );
    }
  }

  if (idNumber) {
    const existingId = await guestRepository.getGuestByIdNumber(idNumber);

    if (existingId) {
      throw new ErrorHandler("Guest with this ID number already exists", 409);
    }
  }

  return await guestRepository.createGuest(guestData);
};

const getAllGuests = async () => {
  return await guestRepository.getAllGuests();
};

const getGuestById = async (id) => {
  const guest = await guestRepository.getGuestById(id);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  return guest;
};

const updateGuest = async (id, guestData) => {
  const guest = await guestRepository.getGuestById(id);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  if (guestData.email && guestData.email !== guest.email) {
    const existingEmail = await guestRepository.getGuestByEmail(
      guestData.email,
    );

    if (existingEmail) {
      throw new ErrorHandler("Guest with this emaiil already exists", 409);
    }
  }

  if (guestData.phone && guestData.phone !== guest.phone) {
    const existingPhone = await guestRepository.getGuestByPhone(
      guestData.phone,
    );

    if (existingPhone) {
      throw new ErrorHandler(
        "Guest with this phone number already exists",
        409,
      );
    }
  }

  if (guestData.idNumber && guestData.idNumber !== guest.idNumber) {
    const existingId = await guestRepository.getGuestByIdNumber(
      guestData.idNumber,
    );

    if (existingId) {
      throw new ErrorHandler("Guest with this IdNumber already exists", 409);
    }
  }

  return await guestRepository.updateGuest(id, guestData);
};

const deleteGuest = async (id) => {
  const guest = await guestRepository.getGuestById(id);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  return await guestRepository.deleteGuest(id);
};

export default {
  createGuest,
  getAllGuests,
  getGuestById,
  updateGuest,
  deleteGuest,
};
