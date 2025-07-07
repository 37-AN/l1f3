"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceSource = exports.AccountProvider = exports.AccountType = exports.Theme = exports.UserRole = exports.Currency = void 0;
var Currency;
(function (Currency) {
    Currency["ZAR"] = "ZAR";
    Currency["USD"] = "USD";
})(Currency || (exports.Currency = Currency = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var Theme;
(function (Theme) {
    Theme["LIGHT"] = "light";
    Theme["DARK"] = "dark";
})(Theme || (exports.Theme = Theme = {}));
var AccountType;
(function (AccountType) {
    AccountType["CHECKING"] = "CHECKING";
    AccountType["SAVINGS"] = "SAVINGS";
    AccountType["CREDIT_CARD"] = "CREDIT_CARD";
    AccountType["INVESTMENT"] = "INVESTMENT";
    AccountType["BUSINESS"] = "BUSINESS";
    AccountType["CRYPTO"] = "CRYPTO";
})(AccountType || (exports.AccountType = AccountType = {}));
var AccountProvider;
(function (AccountProvider) {
    AccountProvider["FNB"] = "FNB";
    AccountProvider["STANDARD_BANK"] = "STANDARD_BANK";
    AccountProvider["ABSA"] = "ABSA";
    AccountProvider["NEDBANK"] = "NEDBANK";
    AccountProvider["CAPITEC"] = "CAPITEC";
    AccountProvider["INVESTEC"] = "INVESTEC";
    AccountProvider["EASY_EQUITIES"] = "EASY_EQUITIES";
    AccountProvider["ALLAN_GRAY"] = "ALLAN_GRAY";
    AccountProvider["SATRIX"] = "SATRIX";
    AccountProvider["LUNO"] = "LUNO";
    AccountProvider["VALR"] = "VALR";
    AccountProvider["BINANCE"] = "BINANCE";
    AccountProvider["MANUAL"] = "MANUAL";
})(AccountProvider || (exports.AccountProvider = AccountProvider = {}));
var BalanceSource;
(function (BalanceSource) {
    BalanceSource["MANUAL"] = "MANUAL";
    BalanceSource["BANK_SYNC"] = "BANK_SYNC";
    BalanceSource["INTEGRATION"] = "INTEGRATION";
    BalanceSource["CALCULATION"] = "CALCULATION";
})(BalanceSource || (exports.BalanceSource = BalanceSource = {}));
//# sourceMappingURL=enums.js.map