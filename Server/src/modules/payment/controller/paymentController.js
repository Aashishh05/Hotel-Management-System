import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import paymentServices from "../services/paymentServices.js";

export const createPayment = asyncErrorHandler(async (req, res) => {
  const payment = await paymentServices.createPayment(req.body);

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    payment,
  });
});

export const getAllPayments = asyncErrorHandler(async (req, res) => {
  const payments = await paymentServices.getAllPayments();

  res.status(200).json({
    success: true,
    payments,
  });
});

export const getPaymentById = asyncErrorHandler(async (req, res) => {
  const payment = await paymentServices.getPaymentById(req.params.id);

  res.status(200).json({
    success: true,
    payment,
  });
});

export const getPaymentsByBilling = asyncErrorHandler(async (req, res) => {
  const payments = await paymentServices.getPaymentsByBilling(
    req.params.billingId,
  );

  res.status(200).json({
    success: true,
    payments,
  });
});

export const getPaymentsByStatus = asyncErrorHandler(async (req, res) => {
  const payments = await paymentServices.getPaymentsByStatus(req.params.status);

  res.status(200).json({
    success: true,
    payments,
  });
});

export const updatePayment = asyncErrorHandler(async (req, res) => {
  const payment = await paymentServices.updatePayment(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Payment updated successfully",
    payment,
  });
});

export const deletePayment = asyncErrorHandler(async (req, res) => {
  await paymentServices.deletePayment(req.params.id);

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
  });
});
