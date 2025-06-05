import { IsNumber, IsString, IsUUID } from "class-validator"

export class PaidOrderDto{

    @IsNumber()
    recepiId:number

    @IsString()
    @IsUUID()
    orderId:string
}