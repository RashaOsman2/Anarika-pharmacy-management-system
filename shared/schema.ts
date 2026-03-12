import { pgTable, text, serial, integer, decimal, timestamp, pgEnum, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['shop1', 'shop2', 'owner']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('shop1'),
  shopName: text("shop_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stock = pgTable("stock", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").references(() => shops.id).notNull(),
  medicineName: text("medicine_name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  unitType: text("unit_type").notNull().default("strip"),
  piecesPerUnit: integer("pieces_per_unit").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").references(() => shops.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  medicineName: text("medicine_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  receiptNumber: text("receipt_number").notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restockHistory = pgTable("restock_history", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").references(() => shops.id).notNull(),
  stockId: integer("stock_id").references(() => stock.id).notNull(),
  medicineName: text("medicine_name").notNull(),
  quantityAdded: integer("quantity_added").notNull(),
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stockRemovalHistory = pgTable("stock_removal_history", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").references(() => shops.id).notNull(),
  stockId: integer("stock_id").references(() => stock.id),
  medicineName: text("medicine_name").notNull(),
  quantityRemoved: integer("quantity_removed").notNull(),
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  removalType: text("removal_type").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true });
export const insertStockSchema = createInsertSchema(stock).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export const insertRestockHistorySchema = createInsertSchema(restockHistory).omit({ id: true, createdAt: true });
export const insertStockRemovalHistorySchema = createInsertSchema(stockRemovalHistory).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertRestockHistory = z.infer<typeof insertRestockHistorySchema>;
export type InsertStockRemovalHistory = z.infer<typeof insertStockRemovalHistorySchema>;

export type User = typeof users.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type Stock = typeof stock.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type RestockHistory = typeof restockHistory.$inferSelect;
export type StockRemovalHistory = typeof stockRemovalHistory.$inferSelect;
