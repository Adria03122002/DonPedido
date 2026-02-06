"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoIngrediente = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
const Ingrediente_1 = require("./Ingrediente");
let ProductoIngrediente = class ProductoIngrediente {
};
exports.ProductoIngrediente = ProductoIngrediente;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductoIngrediente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Producto_1.Producto, producto => producto.ingredientes, {
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Producto_1.Producto)
], ProductoIngrediente.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Ingrediente_1.Ingrediente),
    __metadata("design:type", Ingrediente_1.Ingrediente)
], ProductoIngrediente.prototype, "ingrediente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ProductoIngrediente.prototype, "cantidadNecesaria", void 0);
exports.ProductoIngrediente = ProductoIngrediente = __decorate([
    (0, typeorm_1.Entity)('ProductoIngrediente')
], ProductoIngrediente);
//# sourceMappingURL=ProductoIngrediente.js.map