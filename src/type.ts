import type { Timestamp } from "firebase-admin/firestore";

export interface BookingIn {
    id: string;
    house: string;
    dateFrom: Timestamp;
    dateTo: Timestamp;
    userId: string;
    userEmail: string;
    notes?: string
    numberPeople?: string
}

export interface BookingOut {
    id: string;
    house: string;
    dateFrom: string;
    dateTo: string;
    userId: string;
    userName?: string;
    familyName?: string;
    notes?: string;
}