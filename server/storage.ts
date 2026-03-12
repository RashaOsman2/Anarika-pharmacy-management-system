import { db } from "./db.js";
import { users, shops, stock, sales, restockHistory, stockRemovalHistory } from "../shared/schema.js";
import type { InsertUser, InsertShop, InsertStock, InsertSale, InsertRestockHistory, InsertStockRemovalHistory, User, Shop, Stock, Sale, RestockHistory, StockRemovalHistory } from "../shared/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  updateUserPassword(id: number, password: string): Promise<void>;
  
  getShops(): Promise<Shop[]>;
  getShopByName(name: string): Promise<Shop | undefined>;
  getShopById(id: number): Promise<Shop | undefined>;
  
  getStockByShop(shopId: number): Promise<Stock[]>;
  getStockById(id: number): Promise<Stock | undefined>;
  createStock(item: InsertStock): Promise<Stock>;
  updateStock(id: number, data: Partial<InsertStock>): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<void>;
  
  getSalesByShop(shopId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  getRestockHistoryByShop(shopId: number): Promise<RestockHistory[]>;
  createRestockHistory(history: InsertRestockHistory): Promise<RestockHistory>;
  
  getStockRemovalHistoryByShop(shopId: number): Promise<StockRemovalHistory[]>;
  createStockRemovalHistory(history: InsertStockRemovalHistory): Promise<StockRemovalHistory>;
  
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(users).values({
      ...user,
      password: hashedPassword,
    }).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }

  async getShops(): Promise<Shop[]> {
    return db.select().from(shops);
  }

  async getShopByName(name: string): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.name, name));
    return shop;
  }

  async getShopById(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async getStockByShop(shopId: number): Promise<Stock[]> {
    return db.select().from(stock).where(eq(stock.shopId, shopId));
  }

  async getStockById(id: number): Promise<Stock | undefined> {
    const [item] = await db.select().from(stock).where(eq(stock.id, id));
    return item;
  }

  async createStock(item: InsertStock): Promise<Stock> {
    const [newStock] = await db.insert(stock).values(item).returning();
    return newStock;
  }

  async updateStock(id: number, data: Partial<InsertStock>): Promise<Stock | undefined> {
    const [updated] = await db.update(stock).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(stock.id, id)).returning();
    return updated;
  }

  async deleteStock(id: number): Promise<void> {
    await db.delete(stock).where(eq(stock.id, id));
  }

  async getSalesByShop(shopId: number): Promise<Sale[]> {
    return db.select().from(sales).where(eq(sales.shopId, shopId)).orderBy(desc(sales.createdAt));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  async getRestockHistoryByShop(shopId: number): Promise<RestockHistory[]> {
    return db.select().from(restockHistory).where(eq(restockHistory.shopId, shopId)).orderBy(desc(restockHistory.createdAt));
  }

  async createRestockHistory(history: InsertRestockHistory): Promise<RestockHistory> {
    const [newHistory] = await db.insert(restockHistory).values(history).returning();
    return newHistory;
  }

  async getStockRemovalHistoryByShop(shopId: number): Promise<StockRemovalHistory[]> {
    return db.select().from(stockRemovalHistory).where(eq(stockRemovalHistory.shopId, shopId)).orderBy(desc(stockRemovalHistory.createdAt));
  }

  async createStockRemovalHistory(history: InsertStockRemovalHistory): Promise<StockRemovalHistory> {
    const [newHistory] = await db.insert(stockRemovalHistory).values(history).returning();
    return newHistory;
  }

  async initializeDefaultData(): Promise<void> {
    const existingShops = await this.getShops();
    if (existingShops.length === 0) {
      await db.insert(shops).values([
        { name: "Shop 1" },
        { name: "Shop 2" },
      ]);

      const shop1 = await this.getShopByName("Shop 1");
      const shop2 = await this.getShopByName("Shop 2");

      if (shop1 && shop2) {
        const sampleMedicines = [
          { medicineName: "Paracetamol 500mg", quantity: 100, price: "5.99" },
          { medicineName: "Ibuprofen 400mg", quantity: 75, price: "8.49" },
          { medicineName: "Amoxicillin 250mg", quantity: 50, price: "12.99" },
          { medicineName: "Omeprazole 20mg", quantity: 60, price: "15.49" },
          { medicineName: "Metformin 500mg", quantity: 80, price: "9.99" },
          { medicineName: "Aspirin 100mg", quantity: 120, price: "4.49" },
          { medicineName: "Cetirizine 10mg", quantity: 90, price: "6.99" },
          { medicineName: "Vitamin C 1000mg", quantity: 150, price: "7.99" },
        ];

        for (const medicine of sampleMedicines) {
          await db.insert(stock).values([
            { ...medicine, shopId: shop1.id },
            { ...medicine, shopId: shop2.id },
          ]);
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
