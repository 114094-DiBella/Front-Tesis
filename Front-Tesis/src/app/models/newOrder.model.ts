export class NewOrder {
    detail: newDetailOrder[] = [];
    userId: string = '';
    idFormaPago: string = '';
}

export class newDetailOrder {
    idProduct: string = '';
    quantity: number = 0;
}