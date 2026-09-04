import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import billingServices from "../services/billingServices.js";

export const createBilling = asyncErrorHandler(async (req, res) => {
  const billing = await billingServices.createBilling(req.body);

  res.status(201).json({
    success: true,
    message: "Billing created successfully",
    billing,
  });
});

export const getAllBillings = asyncErrorHandler(async (req, res) => {
  const billings = await billingServices.getAllBillings();

  res.status(200).json({
    success: true,
    billings,
  });
});

export const getBillingById = asyncErrorHandler(async (req, res) => {
  const billing = await billingServices.getBillingById(req.params.id);

  res.status(200).json({
    success: true,
    billing,
  });
});

export const getBillingByBooking = asyncErrorHandler(async (req, res) => {
  const billing = await billingServices.getBillingByBooking(
    req.params.bookingId,
  );

  res.status(200).json({
    success: true,
    billing,
  });
});

export const getBillingsByGuest = asyncErrorHandler(async (req, res) => {
  const billings = await billingServices.getBillingsByGuest(req.params.guestId);

  res.status(200).json({
    success: true,
    billings,
  });
});

export const getBillingsByStatus = asyncErrorHandler(async (req, res) => {
  const billings = await billingServices.getBillingsByStatus(req.params.status);

  res.status(200).json({
    success: true,
    billings,
  });
});

export const updateBilling = asyncErrorHandler(async (req, res) => {
  const billing = await billingServices.updateBilling(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Billing updated successfully",
    billing,
  });
});

export const deleteBilling = asyncErrorHandler(async (req, res) => {
  await billingServices.deleteBilling(req.params.id);

  res.status(200).json({
    success: true,
    message: "Billing deleted successfully",
  });
});
