import { prisma } from "./prisma";
import { getTodayRange } from "../dates";

export async function getNotificationsByDay( userID:string){

      await new Promise((resolve) => setTimeout(resolve, 3000));

  const { startOfToday, startOfTomorrow } = getTodayRange();

    return await prisma.notification.findMany({
        where: {
            userId:userID,
            sendDate:{
                gte: startOfToday, 
                lt:startOfTomorrow,
            },
        },
        orderBy: {
            sendDate: "asc",
        },
        select:{
            description:true,
            sendDate:true,
            id:true,
            amount:true,
        }
    })
}

export async function createNotification (description:string, sendDate:Date, billId:string, userId:string, amount:number) {

    await prisma.notification.create({
        data:{
            description,
            sendDate,
            billId,
            userId,
            amount,
        }
    });
    
}

export async function deleteNotification(id:string, userId:string){
    await prisma.notification.deleteMany({
        where:{
            id,
            userId,
        }
    })
}
