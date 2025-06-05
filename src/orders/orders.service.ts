import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '../../generated/prisma';
import { CreateOrderDto } from './dto/create-order.dto';
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChangeOrderStatusDto, OrderPaginationDto, PaidOrderDto } from './dto';
import { NATS_SERVICE} from '../config';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './orders/interfaces';



@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger =new Logger("OrderService")
constructor
(@Inject(NATS_SERVICE) private readonly client:ClientProxy
){
 super()
}


  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database Connected")
  }

async paidSucceded(paidOrderDto:PaidOrderDto){


 const updatedOrder= await this.order.update({
    where:{
      id:paidOrderDto.orderId
    },
    data:{
      status:"PAID",
      paid:true,
      paidAt:new Date().toISOString(),
      recepiId:paidOrderDto.recepiId.toString(),
      OrderRecipe:{
        create:{
          recipeId:paidOrderDto.recepiId.toString()
        }
      }
    }
  })
  this.logger.log(updatedOrder)
  return updatedOrder

  }



  async createPayment(orderWithProducts:OrderWithProducts){

    const payment= await firstValueFrom(
      this.client.send("create.preference",{
        orderId:orderWithProducts.id,
        items:orderWithProducts.OrderItem.map(item=>{
          return{
            name:item.name,
            price:item.price,
            quantity:item.quantity
          }
        })
      }))
      return payment
  }
  async create(createOrderDto: CreateOrderDto) {
  const productsId=createOrderDto.items.map(i=>i.productId)

  try {

    const products:any[]= await firstValueFrom(
  this.client.send({cmd:"validate-products"},productsId))
    
  const totalAmount=createOrderDto.items.reduce((acc,orderItem)=>{
      const price=products.find(
        product=>product.id=== orderItem.productId)
        .price

        return price * orderItem.quantity
  },0)

 const totalItems=createOrderDto.items.reduce((acc,orderItem)=>{
  return acc  + orderItem.quantity
 },0)

 const order=await this.order.create({
  data:{
    totalAmount,
    totalItems,
    OrderItem:{
      createMany:{
        data:createOrderDto.items.map(orderItem=>({
          price:products.find(
            product=>product.id === orderItem.productId)
            .price,
          quantity:orderItem.quantity,
          productId:orderItem.productId
        }))
      }
    }
  },
  include:{
    OrderItem:{
      select:{
        price:true,
        quantity:true,
        productId:true
      }
    }
  }
 })
 return {
  ...order,
  OrderItem:order.OrderItem.map(orderItem=>({
    ...orderItem,
    name:products.find(product=>product.id===orderItem.productId).name
  }))
 }
    
  } catch (error) {
    throw new RpcException({
      status:HttpStatus.BAD_REQUEST,
      message:"Something went wrong"
    })
  }

  }

  async findAll(orderPaginationDto:OrderPaginationDto) {

 
    const totalPages=await this.order.count({
      where:{
        status:orderPaginationDto.status
      }
    })
    const currentPage=orderPaginationDto.page || 1
    const perPage=orderPaginationDto.limit || 5
   return {
    data:await this.order.findMany({
     skip:(currentPage-1)* perPage,
     take:perPage,
     where:{
      status:orderPaginationDto.status
     }
    }),
      meta:{
      total:totalPages,
      page:currentPage,
      lastPage:Math.ceil(totalPages/perPage)
    }

   } 
  

  }

  async findOne(id: string) {
   const order=await this.order.findFirst({
      where:{
        id
      },
      include:{
        OrderItem:{
          select:{
            price:true,
            quantity:true,
            productId:true
        }
          }
        
      }
    });

      if(!order){
        throw new RpcException({
          status:HttpStatus.NOT_FOUND,
          message:`Order with id ${id} not found`
        })
    }

    const productsId=order.OrderItem.map(orderItem=>orderItem.productId)
        const products:any[]= await firstValueFrom(
  this.client.send({cmd:"validate-products"},productsId))

    return {
      ...order,
      OrderItem:order.OrderItem.map(orderItem=>({
    ...orderItem,
    name:products.find(product=>product.id===orderItem.productId).name
  }))
    }
  }

  async changeOrderStatus(changeOrderStatusDto:ChangeOrderStatusDto){
    const {id,status}=changeOrderStatusDto

    const order=await this.findOne(id)
    if(order.status === status){
      return order
    }
    return this.order.update({
      where:{
        id
      },
      data:{
        status
      }
    })
  }


}
