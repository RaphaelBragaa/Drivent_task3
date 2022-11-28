import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import ticketService from "@/services/tickets-service";
import { TicketStatus } from "@prisma/client";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const VerifyTicket = await ticketService.getTicketByUserId(userId);
    if( VerifyTicket.TicketType.isRemote || VerifyTicket.status === TicketStatus.RESERVED) {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    const result = await hotelService.getHotels();
 
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  try {
    // const { userId } = req;
    // const VerifyTicket = await ticketService.getTicketByUserId(userId);
    // if( VerifyTicket.TicketType.isRemote || VerifyTicket.status === TicketStatus.RESERVED) {
    //   return res.sendStatus(httpStatus.UNAUTHORIZED);
    // }
    const hotelId = Number(req.params.hotelId);
    if(!hotelId) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    const result = await hotelService.getHotelById(hotelId);
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

