import ErrorHandler from "../../../utils/ErrorHandler.js";
import guestRepository from "../repository/guestRepository.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";

const guestLabel = (guest) =>
  [guest?.name, guest?.email].filter(Boolean).join(" ") || "A guest";

const createGuest = async (guestData, userId) => {
  const { email, phone, idNumber } = guestData;

  if (email) {
    const existingEmail = await guestRepository.getGuestByEmail(email);

    if (existingEmail) {
      throw new ErrorHandler("Guest with this email already exists", 409);
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

  const guest = await guestRepository.createGuest(guestData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "guest.created",
    module: "guests",
    targetId: guest._id,
    description: `Guest ${guestLabel(guest)} was added`,
  });

  return guest;
};

const getAllGuests = async (options = {}) => {
  if (options.page && options.limit) {
    return await guestRepository.getAllGuestsWithPagination(options);
  }
  return { guests: await guestRepository.getAllGuests() };
};

const getGuestById = async (id) => {
  const guest = await guestRepository.getGuestById(id);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  return guest;
};

const updateGuest = async (id, guestData, userId) => {
  const guest = await guestRepository.getGuestById(id);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  if (guestData.email && guestData.email !== guest.email) {
    const existingEmail = await guestRepository.getGuestByEmail(
      guestData.email,
    );

    if (existingEmail) {
      throw new ErrorHandler("Guest with this email already exists", 409);
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
      throw new ErrorHandler("Guest with this ID number already exists", 409);
    }
  }

  const updated = await guestRepository.updateGuest(id, guestData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "guest.updated",
    module: "guests",
    targetId: id,
    description: `Guest ${guestLabel(guest)} details were updated`,
  });

  return updated;
};

const deleteGuest = async (id, userId) => {
  const guest = await guestRepository.getGuestById(id);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  await guestRepository.deleteGuest(id);

  await auditLogServices.recordActivity({
    user: userId,
    action: "guest.deleted",
    module: "guests",
    targetId: id,
    description: `Guest ${guestLabel(guest)} was removed`,
  });
};

export default {
  createGuest,
  getAllGuests,
  getGuestById,
  updateGuest,
  deleteGuest,
};
