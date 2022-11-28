import faker from "@faker-js/faker";
import { prisma } from "@/config";

export function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.city(),
      Rooms: {
        createMany: {
          data: [
            {
              name: faker.name.findName(),
              capacity: 1,
            },
            {
              name: faker.name.findName(),
              capacity: 2,
            },
          ],
        },
      },
    },
    include: {
      Rooms: true
    },
  });
}
