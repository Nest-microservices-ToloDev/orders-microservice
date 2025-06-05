import { Controller,  ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload,EventPattern } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ChangeOrderStatusDto, CreateOrderDto, OrderPaginationDto, PaidOrderDto } from './dto';


@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}





@MessagePattern('createOrder')
 async  create(@Payload() createOrderDto: CreateOrderDto) {

  const order=await this.ordersService.create(createOrderDto)
  const payment=await this.ordersService.createPayment(order)
    return {
      order,
      payment
    }
  }

@MessagePattern('findAllOrders')
findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
  return this.ordersService.findAll(orderPaginationDto);
}

  @MessagePattern('findOneOrder')
  findOne(@Payload("id",ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern("changeOrderStatus")
  changeOrderStatus(@Payload() changeOrderStatusDto:ChangeOrderStatusDto){
    return this.ordersService.changeOrderStatus(changeOrderStatusDto)
  }

  @EventPattern("payment.succeded")
  paidOrder(@Payload() paidOrderDto:PaidOrderDto){

    return this.ordersService.paidSucceded(paidOrderDto)
  }

}
