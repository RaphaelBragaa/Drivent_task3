import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";

async function getHotels() {
  const hotels = await hotelsRepository.findManyHotels();

  if (!hotels) {
    throw notFoundError();
  }
  return hotels;
}

async function getHotelById(hotelId: number) {
  const result = await hotelsRepository.findHotelById(hotelId);
  if (!result) {
    throw notFoundError();
  }

  return result;
}

const hotelService = {
  getHotels,
  getHotelById,
};

export default hotelService;
