import Billing from "../model/billingModel.js";

const createBilling = async (billingData) => {
  return await Billing.create(billingData);
};

const getAllBillings = async () => {
  return await Billing.find()
    .populate("booking")
    .populate("guest")
    .sort({ createdAt: -1 });
};

const getBillingById = async (id) => {
  return await Billing.findById(id).populate("booking").populate("guest");
};

const getBillingByBooking = async (bookingId) => {
  return await Billing.findOne({ booking: bookingId })
    .populate("booking")
    .populate("guest");
};

const getBillingsByGuest = async (guestId) => {
  return await Billing.find({ guest: guestId })
    .populate("booking")
    .populate("guest")
    .sort({ createdAt: -1 });
};

const getBillingsByStatus = async (status) => {
  return await Billing.find({ status })
    .populate("booking")
    .populate("guest")
    .sort({ createdAt: -1 });
};

const updateBilling = async (id, billingData) => {
  return await Billing.findByIdAndUpdate(id, billingData, {
    new: true,
    runValidators: true,
  })
    .populate("booking")
    .populate("guest");
};

const deleteBilling = async (id) => {
  return await Billing.findByIdAndDelete(id);
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
