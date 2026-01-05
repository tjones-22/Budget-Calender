export class SignupDTO{
    name:string;
    username:string;
    password:string;
    phone:string;
    initialFunds?: number;
    initialSavings?: number;
    notifyBills?: boolean;
    notifyPaydays?: boolean;
}
