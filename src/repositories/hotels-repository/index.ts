import { prisma } from "@/config";

async function findManyHotels() {
  return prisma.hotel.findMany();
}

async function findHotelById(hotelId: number) {
  return prisma.room.findFirst({
    where: {
      id: hotelId,
    }, include: {
      Hotel: true,
    }
  });
}

const hotelsRepository = {
  findManyHotels,
  findHotelById,
};

export default hotelsRepository;
