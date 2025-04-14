export class User {
    id?: string; 
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    telephone?: number;
    numberDoc?: number;
    birthday?: Date; 
    createdAt?: Date;
    updatedAt?: Date;


    constructor(data?: Partial<User>) {
        this.id = data?.id;
        this.firstName = data?.firstName;
        this.lastName = data?.lastName;
        this.email = data?.email;
        this.password = data?.password;
        this.telephone = data?.telephone;
        this.numberDoc = data?.numberDoc;
        this.birthday = data?.birthday;
        this.createdAt = data?.createdAt;
        this.updatedAt = data?.updatedAt;
    }
}