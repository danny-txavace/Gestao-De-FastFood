import { Component } from '@angular/core';
import { DeleteDialog } from "../delete-dialog/delete-dialog";
import { UserCreateDialog } from "../user-create-dialog/user-create-dialog";
import { UserUpdateDialog } from "../user-update-dialog/user-update-dialog";
import { IngredientCreateDialog } from "../ingredient-create-dialog/ingredient-create-dialog";
import { IngredientUpdateDialog } from "../ingredient-update-dialog/ingredient-update-dialog";
import { ProductCreateDialog } from "../product-create-dialog/product-create-dialog";
import { ProductUpdateDialog } from "../product-update-dialog/product-update-dialog";
import { DialogProductIngredient } from "../PRODUCT_INGREDIENTS/dialog-product-ingredient/dialog-product-ingredient";
import { CreateProductIngredientDialog } from "../PRODUCT_INGREDIENTS/create-product-ingredient-dialog/create-product-ingredient-dialog";
import { UpdateProductIngredientDialog } from "../PRODUCT_INGREDIENTS/update-product-ingredient-dialog/update-product-ingredient-dialog";
import { OpenCashRegisterDialog } from "../CASH_REGISTER/open-cash-register-dialog/open-cash-register-dialog";
import { CloseCashRegisterDialog } from "../CASH_REGISTER/close-cash-register-dialog/close-cash-register-dialog";
import { CreateCashRegisterDialog } from "../CASH_REGISTER/create-cash-register-dialog/create-cash-register-dialog";
import { DetailsCashRegisterDialog } from "../CASH_REGISTER/details-cash-register-dialog/details-cash-register-dialog";
import { CustomerCreateDialog } from "../customer-create-dialog/customer-create-dialog";
import { CustomerUpdateDialog } from "../customer-update-dialog/customer-update-dialog";
import { PosCreateNewOrderDialog } from "../POS/pos-create-new-order-dialog/pos-create-new-order-dialog";
import { PosCreatePaymentDialog } from "../POS/pos-create-payment-dialog/pos-create-payment-dialog";
import { PosUpdatePaymentDialog } from "../POS/pos-update-payment-dialog/pos-update-payment-dialog";
import { PosCloseCashMovementsDialog } from "../POS/pos-close-cash-movements-dialog/pos-close-cash-movements-dialog";
import { PosCashInOutCashMovementsDialog } from "../POS/pos-cash-in-out-cash-movements-dialog/pos-cash-in-out-cash-movements-dialog";
import { PosOpenCashRegisterDialog } from "../POS/pos-open-cash-register-dialog/pos-open-cash-register-dialog";

@Component({
  selector: 'app-dialogs',
  imports: [
    DeleteDialog,
    UserCreateDialog,
    UserUpdateDialog,
    IngredientCreateDialog,
    IngredientUpdateDialog,
    ProductCreateDialog,
    ProductUpdateDialog,
    DialogProductIngredient,
    CreateProductIngredientDialog,
    UpdateProductIngredientDialog,
    OpenCashRegisterDialog,
    CloseCashRegisterDialog,
    CreateCashRegisterDialog,
    DetailsCashRegisterDialog,
    CustomerCreateDialog,
    CustomerUpdateDialog,
    PosCreateNewOrderDialog,
    PosCreatePaymentDialog,
    PosUpdatePaymentDialog,
    PosCloseCashMovementsDialog,
    PosCashInOutCashMovementsDialog,
    PosOpenCashRegisterDialog
],
  templateUrl: './dialogs.html',
  styleUrl: './dialogs.scss',
})
export class Dialogs {

}
