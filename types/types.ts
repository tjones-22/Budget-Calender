import type { ReactNode } from "react";

export type BillType = "payday" | "bill" | "purchase" | "savings";

export type Bill = {
  type: BillType;
  name: string;
  date?: Date
};
export type Notification ={
  id: string,
  description:string,
  sendDate: Date,
  
}

export type Day = {
  dayNumber: number;
  bills: Bill[];
};

export type AuthFormState = {
  error?: string;
};

export type UpdateUserProfileFormState = {
  error?: string;
  success?: string;
};

export type SignUpWithCredentialsInput = {
  email?: string;
  name?: string;
  username: string;
  password: string;
};

export type LoginWithCredentialsInput = {
  username: string;
  password: string;
};

export type UpdateBankStartingBalanceByUserIdInput = {
  userId: string;
  startingBalance: number;
};

export type UpdateUserProfileDBInput = {
  username?:string,
  name:string,
  password?:string,
  email?:string,
  userId:string,
}

export type SubmitButtonProps = {
  children: ReactNode;
  pendingText?: string;
  className?: string;
};

export type AddBillInput = {
  name: string;
  type: BillType;
  date: Date;
  userId: string;
};
