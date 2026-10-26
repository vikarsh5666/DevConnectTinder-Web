export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  emailId?: string;
  photoUrl?: string;
  profilePhoto?: { url?: string };
  about?: string;
  age?: number | string;
  gender?: string;
};

export type ConnectionRequest = {
  _id: string;
  fromUserId: User;
};
