import Payment from "../model/paymentModel.js";

const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

const getAllPayments = async () => {
  return await Payment.find()
    .populate({
      path: "billing",
      populate: [
        {
          path: "booking",
        },
        {
          path: "guest",
        },
      ],
    })
    .sort({ createdAt: -1 });
};

const getPaymentById = async (id) => {
  return await Payment.findById(id).populate({
    path: "billing",
    populate: [
      {
        path: "booking",
      },
      {
        path: "guest",
      },
    ],
  });
};

const getPaymentsByBilling = async (billingId) => {
  return await Payment.find({ billing: billingId }).sort({
    createdAt: -1,
  });
};

const getPaymentsByStatus = async (status) => {
  return await Payment.find({ status })
    .populate("billing")
    .sort({ createdAt: -1 });
};

const updatePayment = async (id, paymentData) => {
  return await Payment.findByIdAndUpdate(id, paymentData, {
    new: true,
    runValidators: true,
  }).populate({
    path: "billing",
    populate: [
      {
        path: "booking",
      },
      {
        path: "guest",
      },
    ],
  });
};

const deletePayment = async (id) => {
  return await Payment.findByIdAndDelete(id);
};

export default {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByBilling,
  getPaymentsByStatus,
  updatePayment,
  deletePayment,
};
