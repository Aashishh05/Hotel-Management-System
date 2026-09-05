import Room from "../../room/model/roomModel.js";
import Booking from "../../booking/model/bookingModel.js";
import Billing from "../../billing/model/billingModel.js";
import Payment from "../../payment/model/paymentModel.js";
import RestaurantOrder from "../../resturantOrder/model/resturantOrderModel.js";

const getDashboardReport = async () => {
  const [roomStats, bookingStats, billingStats, paymentStats, restaurantStats] =
    await Promise.all([
      Room.aggregate([
        {
          $group: {
            _id: null,
            totalRooms: { $sum: 1 },

            occupiedRooms: {
              $sum: {
                $cond: [{ $eq: ["$status", "occupied"] }, 1, 0],
              },
            },

            availableRooms: {
              $sum: {
                $cond: [{ $eq: ["$status", "available"] }, 1, 0],
              },
            },

            reservedRooms: {
              $sum: {
                $cond: [{ $eq: ["$status", "reserved"] }, 1, 0],
              },
            },

            maintenanceRooms: {
              $sum: {
                $cond: [{ $eq: ["$status", "maintenance"] }, 1, 0],
              },
            },
          },
        },
      ]),

      Booking.aggregate([
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },

            confirmedBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0],
              },
            },

            checkedInBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "checked-in"] }, 1, 0],
              },
            },

            checkedOutBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "checked-out"] }, 1, 0],
              },
            },

            cancelledBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
              },
            },
          },
        },
      ]),

      Billing.aggregate([
        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: "$totalAmount",
            },

            paidAmount: {
              $sum: "$paidAmount",
            },

            outstandingAmount: {
              $sum: "$dueAmount",
            },
          },
        },
      ]),

      Payment.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,

            totalPayments: {
              $sum: 1,
            },

            totalPaid: {
              $sum: "$amount",
            },
          },
        },
      ]),

      RestaurantOrder.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,

            totalOrders: {
              $sum: 1,
            },

            restaurantRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

  return {
    rooms: roomStats[0] || {
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      reservedRooms: 0,
      maintenanceRooms: 0,
    },

    bookings: bookingStats[0] || {
      totalBookings: 0,
      confirmedBookings: 0,
      checkedInBookings: 0,
      checkedOutBookings: 0,
      cancelledBookings: 0,
    },

    billing: billingStats[0] || {
      totalRevenue: 0,
      paidAmount: 0,
      outstandingAmount: 0,
    },

    payments: paymentStats[0] || {
      totalPayments: 0,
      totalPaid: 0,
    },

    restaurant: restaurantStats[0] || {
      totalOrders: 0,
      restaurantRevenue: 0,
    },
  };
};

export default {
  getDashboardReport,
};
