import billingRepository from "../../billing/repository/billingRepository.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import paymentRepository from "../repository/paymentRepository.js";

const createPayment = async (paymentData, userId) => {
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

  const payment = await paymentRepository.createPayment({
    billing,
    amount,
    method,
    transactionId,
    status,
    paidAt,
    notes,
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: `payment.${status}`,
    module: "payment",
    targetId: payment._id,
    description: `Payment of $${Number(amount).toFixed(2)} recorded via ${
      method
    }${status === "completed" ? " and marked completed" : ""}`,
  });

  return payment;
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

const updatePayment = async (id, paymentData, userId) => {
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

  const updatedPayment = await paymentRepository.updatePayment(
    id,
    paymentData,
  );

  if (paymentData.status && paymentData.status !== payment.status) {
    await auditLogServices.recordActivity({
      user: userId,
      action: `payment.${paymentData.status}`,
      module: "payment",
      targetId: payment._id,
      description: `Payment of $${Number(
        updatedPayment.amount,
      ).toFixed(2)} marked as ${paymentData.status}`,
    });
  }

  return updatedPayment;
};

const deletePayment = async (id, userId) => {
  const payment = await paymentRepository.getPaymentById(id);

  if (!payment) {
    throw new ErrorHandler("Payment not found", 404);
  }

  if (payment.status === "completed") {
    throw new ErrorHandler("Completed payments cannot be deleted", 400);
  }

  await auditLogServices.recordActivity({
    user: userId,
    action: "payment.deleted",
    module: "payment",
    targetId: payment._id,
    description: `Payment of $${Number(payment.amount).toFixed(
      2,
    )} was deleted`,
  });

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
