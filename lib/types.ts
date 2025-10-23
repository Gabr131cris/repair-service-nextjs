export type Car = {
  id?: string; // ✅ ID-ul documentului Firestore
  title: string;
  price: number;
  description: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  status: string;
  ownerId: string;
  images: {
    exterior: string[];
    interior: string[];
    mechanical: string[];
  };
};
