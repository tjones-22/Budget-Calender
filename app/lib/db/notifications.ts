import { prisma } from "./prisma";

export async function getNotificationsByDay( userID:string){
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

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
        }
    })
}

export async function createNotification (description:string, sendDate:Date, billId:string, userId:string) {

    await prisma.notification.create({
        data:{
            description,
            sendDate,
            billId,
            userId,
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
