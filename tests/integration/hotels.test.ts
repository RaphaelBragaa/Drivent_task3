import supertest  from "supertest";
import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { createUser, createHotel } from "../factories";
import { generateValidToken } from "../helpers";
import { createEnrollmentWithAddress, createTicketType, createTicket } from "../factories";
import { TicketStatus } from "@prisma/client";
import { cleanDb } from "../helpers";

const api = supertest(app);

beforeAll(async () => {
  await init();
  await cleanDb();
});

export async function createTicketTypeByHotel(includesHotel = true) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel,
    },
  });
}

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await api.get("/hotels");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if given token is not valid", async () => {  
    const token = faker.lorem.word(); 
    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no session for given token", async () => { 
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe("when token is valid", () => {
  it("should respond with status 204 when there is no enrollment for given user", async () => { 
    const token = await generateValidToken();

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NO_CONTENT);
  });
  it("should respond with an empty array when there is no hotel added", async () => {
    const token = await generateValidToken();

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NO_CONTENT);
    expect(response.body).toEqual([]);
  });
  it("should respond with 401 status if ticket status is RESERVED and or not include hotel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeByHotel(false);

    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
 
  it("should respond with status 200 and with hotels data", async () => {
    const hotel = await createHotel();
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeByHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual([{
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      createdAt: hotel.createdAt.toISOString(),
      updatedAt: hotel.updatedAt.toISOString(),
    },
    ]);
  });
});
describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await api.get("/hotels/1");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if given token is not valid", async () => {  
    const token = faker.lorem.word(); 
    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no session for given token", async () => { 
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe("when token is valid", () => {
  it("should respond with status 204 when there is no enrollment for given user", async () => { 
    const token = await generateValidToken();

    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it("should respond with an empty array when there is no hotelId added", async () => {
    const token = await generateValidToken();

    const response = await api.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
    expect(response.body).toEqual([]);
  });
  it("should respond with status 200 and with rooms data", async () => {
    const hotel = await createHotel();
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeByHotel(false);

    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await api.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    console.log(hotel);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      createdAt: hotel.createdAt.toISOString(),
      updatedAt: hotel.updatedAt.toISOString(),
      Rooms: [
        {
          id: hotel.Rooms[0].id,
          name: hotel.Rooms[0].name,
          capacity: hotel.Rooms[0].capacity,
          hotelId: hotel.id,
          bookeds: expect.any(Number),
          createdAt: hotel.Rooms[0].createdAt.toISOString(),
          updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
        },
        {
          id: hotel.Rooms[1].id,
          name: hotel.Rooms[1].name,
          capacity: hotel.Rooms[1].capacity,
          hotelId: hotel.id,
          bookeds: expect.any(Number),
          createdAt: hotel.Rooms[1].createdAt.toISOString(),
          updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
        },
      ],
    });
  });
});
