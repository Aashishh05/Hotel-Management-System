import bookingRepository from "../../../modules/booking/repository/bookingRepository.js";
import guestRepository from "../../../modules/guest/repository/guestRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import billingRepository from "../repository/billingRepository.js";

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + item.amount * item.quantity;
  }, 0);
};

const createBilling = async (billingData) => {
  const { booking, guest, items = [], paidAmount = 0, dueDate } = billingData;

  const existingBooking = await bookingRepository.getBookingById(booking);

  if (!existingBooking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  const existingGuest = await guestRepository.getGuestById(guest);

  if (!existingGuest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  if (existingBooking.guest._id.toString() !== guest.toString()) {
    throw new ErrorHandler("Guest does not belong to this booking", 400);
  }

  const existingBilling = await billingRepository.getBillingByBooking(booking);

  if (existingBilling) {
    throw new ErrorHandler("Billing already exists for this booking", 409);
  }

  const totalAmount = calculateTotal(items);

  if (paidAmount > totalAmount) {
    throw new ErrorHandler("Paid amount cannot exceed total amount", 400);
  }

  let status = "unpaid";

  if (paidAmount === totalAmount && totalAmount > 0) {
    status = "paid";
  } else if (paidAmount > 0) {
    status = "partial";
  }

  return await billingRepository.createBilling({
    booking,
    guest,
    items,
    totalAmount,
    paidAmount,
    status,
    dueDate,
  });
};

const getAllBillings = async () => {
  return await billingRepository.getAllBillings();
};

const getBillingById = async (id) => {
  const billing = await billingRepository.getBillingById(id);

  if (!billing) {
    throw new ErrorHandler("Billing not found", 404);
  }

  return billing;
};

const getBillingByBooking = async (bookingId) => {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  const billing = await billingRepository.getBillingByBooking(bookingId);

  if (!billing) {
    throw new ErrorHandler("Billing not found for this booking", 404);
  }

  return billing;
};

const getBillingsByGuest = async (guestId) => {
  const guest = await guestRepository.getGuestById(guestId);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  return await billingRepository.getBillingsByGuest(guestId);
};

const getBillingsByStatus = async (status) => {
  const allowedStatuses = ["unpaid", "partial", "paid"];

  if (!allowedStatuses.includes(status)) {
    throw new ErrorHandler("Invalid billing status", 400);
  }

  return await billingRepository.getBillingsByStatus(status);
};

const updateBilling = async (id, billingData) => {
  const billing = await billingRepository.getBillingById(id);

  if (!billing) {
    throw new ErrorHandler("Billing not found", 404);
  }

  let totalAmount = billing.totalAmount;

  if (billingData.items) {
    totalAmount = calculateTotal(billingData.items);
    billingData.totalAmount = totalAmount;
  }

  const paidAmount = billingData.paidAmount ?? billing.paidAmount;

  if (paidAmount > totalAmount) {
    throw new ErrorHandler("Paid amount cannot exceed total amount", 400);
  }

  if (paidAmount === totalAmount && totalAmount > 0) {
    billingData.status = "paid";
  } else if (paidAmount > 0) {
    billingData.status = "partial";
  } else {
    billingData.status = "unpaid";
  }

  return await billingRepository.updateBilling(id, billingData);
};

const deleteBilling = async (id) => {
  const billing = await billingRepository.getBillingById(id);

  if (!billing) {
    throw new ErrorHandler("Billing not found", 404);
  }

  if (billing.paidAmount > 0) {
    throw new ErrorHandler("Billing with payments cannot be deleted", 400);
  }

  return await billingRepository.deleteBilling(id);
};

export default {
  createBilling,
  getAllBillings,
  getBillingById,
  getBillingByBooking,
  getBillingsByGuest,
  getBillingsByStatus,
  updateBilling,
  deleteBilling,
};
