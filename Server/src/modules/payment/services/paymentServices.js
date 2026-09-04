import billingRepository from "../../billing/repository/billingRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import paymentRepository from "../repository/paymentRepository.js";

const createPayment = async (paymentData) => {
  const {
    billing,
    amount,
    method,
    transactionId,
    status = "pending",
    notes,
  } = paymentData;

  const existingBilling = await billingRepository.getBillingById(billing);

  if (!existingBilling) {
    throw new ErrorHandler("Billing not found", 404);
  }

  if (!amount || amount <= 0) {
    throw new ErrorHandler("Payment amount must be greater than 0", 400);
  }

  const remainingAmount =
    existingBilling.totalAmount - existingBilling.paidAmount;

  if (amount > remainingAmount) {
    throw new ErrorHandler(
      `Payment amount cannot exceed remaining balance of ${remainingAmount}`,
      400,
    );
  }

  if (status === "completed") {
    const newPaidAmount = existingBilling.paidAmount + amount;

    let billingStatus = "partial";

    if (newPaidAmount === existingBilling.totalAmount) {
      billingStatus = "paid";
    }

    await billingRepository.updateBilling(billing, {
      paidAmount: newPaidAmount,
      status: billingStatus,
    });
  }

  let paidAt = null;

  if (status === "completed") {
    paidAt = new Date();
  }

  return await paymentRepository.createPayment({
    billing,
    amount,
    method,
    transactionId,
    status,
    paidAt,
    notes,
  });
};

const getAllPayments = async () => {
  return await paymentRepository.getAllPayments();
};

const getPaymentById = async (id) => {
  const payment = await paymentRepository.getPaymentById(id);

  if (!payment) {
    throw new ErrorHandler("Payment not found", 404);
  }

  return payment;
};

const getPaymentsByBilling = async (billingId) => {
  const billing = await billingRepository.getBillingById(billingId);

  if (!billing) {
    throw new ErrorHandler("Billing not found", 404);
  }

  return await paymentRepository.getPaymentsByBilling(billingId);
};

const getPaymentsByStatus = async (status) => {
  const allowedStatuses = ["pending", "completed", "failed", "refunded"];

  if (!allowedStatuses.includes(status)) {
    throw new ErrorHandler("Invalid payment status", 400);
  }

  return await paymentRepository.getPaymentsByStatus(status);
};

const updatePayment = async (id, paymentData) => {
  const payment = await paymentRepository.getPaymentById(id);

  if (!payment) {
    throw new ErrorHandler("Payment not found", 404);
  }

  if (
    paymentData.billing &&
    paymentData.billing.toString() !== payment.billing._id.toString()
  ) {
    throw new ErrorHandler("Payment billing cannot be changed", 400);
  }

  if (
    payment.status === "completed" &&
    (paymentData.amount || paymentData.status)
  ) {
    throw new ErrorHandler(
      "Completed payments cannot have amount or status changed",
      400,
    );
  }

  if (paymentData.status === "completed") {
    paymentData.paidAt = new Date();
  }

  if (paymentData.status === "pending" || paymentData.status === "failed") {
    paymentData.paidAt = null;
  }

  return await paymentRepository.updatePayment(id, paymentData);
};

const deletePayment = async (id) => {
  const payment = await paymentRepository.getPaymentById(id);

  if (!payment) {
    throw new ErrorHandler("Payment not found", 404);
  }

  if (payment.status === "completed") {
    throw new ErrorHandler("Completed payments cannot be deleted", 400);
  }

  return await paymentRepository.deletePayment(id);
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
