import "dotenv/config";

import Room from "../modules/room/model/roomModel.js";
import Booking from "../modules/booking/model/bookingModel.js";
import HouseKeeping from "../modules/houseKeeping/model/houseKeepingModel.js";
import Maintenance from "../modules/maintenance/model/maintenanceModel.js";
import RestaurantOrder from "../modules/resturantOrder/model/resturantOrderModel.js";
import Notification from "../modules/notification/model/notificationModel.js";

import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

const CLOUDINARY_ROOM_FOLDER = "hotel-management-system/rooms";

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;

const ROOMS = [
  {
    number: "101",
    type: "single",
    floor: 1,
    pricePerNight: 80,
    amenities: ["Free Wi-Fi", "Smart TV", "Air Conditioning", "Work Desk"],
    description:
      "Cozy single room on the first floor, perfect for solo travelers. Includes a work desk, blackout curtains, and a modern en-suite bathroom.",
    images: [
      unsplash("photo-1590490360182-c33d57733427"),
      unsplash("photo-1591088398332-8a7791972843"),
      unsplash("photo-1584622650111-993a426fbf0a"),
    ],
  },
  {
    number: "102",
    type: "single",
    floor: 1,
    pricePerNight: 80,
    amenities: ["Free Wi-Fi", "Smart TV", "Air Conditioning", "Minibar"],
    description:
      "Tidy single room with warm lighting and a comfortable bed. Great value for short business trips, just steps from the elevator.",
    images: [
      unsplash("photo-1560448204-e02f11c3d0e2"),
      unsplash("photo-1507652313519-d4e9174996dd"),
      unsplash("photo-1552321554-5fefe8c9ef14"),
    ],
  },
  {
    number: "103",
    type: "single",
    floor: 1,
    pricePerNight: 85,
    amenities: ["Free Wi-Fi", "Smart TV", "Air Conditioning", "City View"],
    description:
      "Quiet single room with city views and a bright, minimal interior. Freshly refreshed decor with a rainfall shower bathroom.",
    images: [
      unsplash("photo-1598928506311-c55ded91a20c"),
      unsplash("photo-1631049307264-da0ec9d70304"),
      unsplash("photo-1616593969747-4797dc75033e"),
    ],
  },
  {
    number: "104",
    type: "single",
    floor: 1,
    pricePerNight: 85,
    amenities: [
      "Free Wi-Fi",
      "Smart TV",
      "Air Conditioning",
      "24/7 Room Service",
    ],
    description:
      "Charming single room accented with indoor plants and natural light. Ideal for a relaxed one-night stay.",
    images: [
      unsplash("photo-1522771739844-6a9f6d5f14af"),
      unsplash("photo-1560185007-cde436f6a4d0"),
      unsplash("photo-1600566752355-35792bedcfea"),
    ],
  },
  {
    number: "201",
    type: "double",
    floor: 2,
    pricePerNight: 120,
    amenities: ["Free Wi-Fi", "Smart TV", "Air Conditioning", "Minibar"],
    description:
      "Comfortable double room with a queen bed and a cozy reading corner. The large window brings in plenty of afternoon light.",
    images: [
      unsplash("photo-1618773928121-c32242e63f39"),
      unsplash("photo-1513694203232-719a280e022f"),
      unsplash("photo-1560185127-6ed189bf02f4"),
    ],
  },
  {
    number: "202",
    type: "double",
    floor: 2,
    pricePerNight: 120,
    amenities: ["Free Wi-Fi", "Smart TV", "Air Conditioning", "Minibar"],
    description:
      "Inviting double room in soft neutral tones with a stocked minibar. A calm space near the hotel lounge.",
    images: [
      unsplash("photo-1566665797739-1674de7a421a"),
      unsplash("photo-1540518614846-7eded433c457"),
      unsplash("photo-1600566753086-00f18fb6b3ea"),
    ],
  },
  {
    number: "203",
    type: "double",
    floor: 2,
    pricePerNight: 135,
    amenities: [
      "Free Wi-Fi",
      "Smart TV",
      "Air Conditioning",
      "Minibar",
      "King Bed",
    ],
    description:
      "Classic double room with a king bed and stylish wood accents. Freshly made interiors with a modern bathroom.",
    images: [
      unsplash("photo-1505693416388-ac5ce068fe85"),
      unsplash("photo-1600494603989-9650cf6ddd3d"),
      unsplash("photo-1600210491369-e753d80a41f3"),
    ],
  },
  {
    number: "204",
    type: "double",
    floor: 2,
    pricePerNight: 135,
    amenities: [
      "Free Wi-Fi",
      "Smart TV",
      "Air Conditioning",
      "Minibar",
      "Balcony",
    ],
    description:
      "Bright double room with a private balcony and restful bedding. A favorite among our regular guests.",
    images: [
      unsplash("photo-1519690889869-e705e59f72e1"),
      unsplash("photo-1578898887932-dce23a595ad4"),
      unsplash("photo-1586023492125-27b2c045efd7"),
    ],
  },
  {
    number: "301",
    type: "deluxe",
    floor: 3,
    pricePerNight: 180,
    amenities: [
      "Free Wi-Fi",
      "55-inch Smart TV",
      "Air Conditioning",
      "Minibar",
      "In-room Safe",
      "Coffee Machine",
    ],
    description:
      "Bold deluxe room with rich textures and mood lighting. A king-size bed, in-room safe, and espresso machine make it ideal for premium comfort.",
    images: [
      unsplash("photo-1578683010236-d716f9a3f461"),
      unsplash("photo-1600585154340-be6161a56a0c"),
      unsplash("photo-1554995207-c18c203602cb"),
    ],
  },
  {
    number: "302",
    type: "deluxe",
    floor: 3,
    pricePerNight: 190,
    amenities: [
      "Free Wi-Fi",
      "55-inch Smart TV",
      "Air Conditioning",
      "Minibar",
      "In-room Safe",
      "Panoramic View",
    ],
    description:
      "Spacious deluxe room with floor-to-ceiling windows and open views. Wake up to the scenery with your morning coffee on the lounger.",
    images: [
      unsplash("photo-1600210492486-724fe5c67fb0"),
      unsplash("photo-1520250497591-112f2f40a3f4"),
      unsplash("photo-1568495248636-6432b97bd949"),
    ],
  },
  {
    number: "303",
    type: "suite",
    floor: 3,
    pricePerNight: 260,
    amenities: [
      "Free Wi-Fi",
      "Smart TV",
      "Air Conditioning",
      "Minibar",
      "Living Area",
      "Bathtub",
      "In-room Safe",
    ],
    description:
      "Elegant suite with a separate living area, plush sofa, and deep soaking bathtub. Designed for guests who want extra space to unwind.",
    images: [
      unsplash("photo-1560448075-bb485b067938"),
      unsplash("photo-1567767292278-a4f21aa2d36e"),
      unsplash("photo-1551632436-cbf8dd35adfa"),
    ],
  },
  {
    number: "304",
    type: "suite",
    floor: 3,
    pricePerNight: 280,
    amenities: [
      "Free Wi-Fi",
      "Smart TV",
      "Air Conditioning",
      "Minibar",
      "Private Lounge Corner",
      "Bathtub",
      "In-room Safe",
    ],
    description:
      "Signature suite with panoramic windows, a private lounge corner, and premium bedding. The top choice for special occasions.",
    images: [
      unsplash("photo-1584132967334-10e028bd69f7"),
      unsplash("photo-1571003123894-1f0594d2b5d9"),
      unsplash("photo-1522708323590-d24dbb6b0267"),
    ],
  },
];

const wipeLinkedData = async () => {
  for (const Model of [Booking, HouseKeeping, Maintenance, RestaurantOrder]) {
    const result = await Model.deleteMany({});
    if (result.deletedCount > 0) {
      console.log(`Cleared ${result.deletedCount} ${Model.modelName} records`);
    }
  }

  // Stale notifications referencing deleted bookings/rooms
  const notifs = await Notification.deleteMany({});
  if (notifs.deletedCount > 0) {
    console.log(`Cleared ${notifs.deletedCount} stale notifications`);
  }
};

const wipeRooms = async () => {
  const oldRooms = await Room.deleteMany({});
  console.log(`Deleted ${oldRooms.deletedCount} old room records`);

  // Remove every leftover image in the Cloudinary rooms folder
  const { resources } = await cloudinary.api.resources({
    type: "upload",
    prefix: CLOUDINARY_ROOM_FOLDER,
    max_results: 500,
  });

  if (resources.length === 0) {
    console.log("No old Cloudinary room images to delete");
    return;
  }

  for (let i = 0; i < resources.length; i += 8) {
    await Promise.all(
      resources.slice(i, i + 8).map((r) => cloudinary.uploader.destroy(r.public_id)),
    );
  }

  console.log(`Deleted ${resources.length} old Cloudinary room images`);
};

const uploadImageFromUrl = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to download image (HTTP ${res.status}): ${url}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const result = await uploadToCloudinary(buffer, CLOUDINARY_ROOM_FOLDER);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

const seedRooms = async () => {
  console.log("Clearing old rooms, room images and linked test data...");
  await wipeLinkedData();
  await wipeRooms();

  console.log(`Creating ${ROOMS.length} new rooms...`);

  for (const roomData of ROOMS) {
    const images = await Promise.all(
      roomData.images.map((image) => uploadImageFromUrl(image)),
    );

    const room = await Room.create({
      number: roomData.number,
      type: roomData.type,
      floor: roomData.floor,
      pricePerNight: roomData.pricePerNight,
      amenities: roomData.amenities,
      description: roomData.description,
      images,
    });

    console.log(
      `Created ${room.type} room ${room.number} with ${images.length} images`,
    );
  }
};

export default seedRooms;
