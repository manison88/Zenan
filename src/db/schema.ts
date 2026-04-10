import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ── Trucks ──────────────────────────────────────────────────────────────────
export const trucks = sqliteTable("trucks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  truckNumber: text("truck_number").notNull().unique(),
  isDemo: integer("is_demo").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

export const trucksRelations = relations(trucks, ({ many, one }) => ({
  odometerLogs: many(odometerLogs),
  trips: many(trips),
  fuelLogs: many(fuelLogs),
  repairs: many(repairs),
  fixedCosts: one(fixedCosts),
  customFixedCosts: many(customFixedCosts),
}));

// ── Odometer Logs ───────────────────────────────────────────────────────────
export const odometerLogs = sqliteTable(
  "odometer_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    truckId: integer("truck_id")
      .notNull()
      .references(() => trucks.id, { onDelete: "cascade" }),
    weekStartDate: text("week_start_date").notNull(),
    startingReading: real("starting_reading").notNull(),
    endingReading: real("ending_reading").notNull(),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("odometer_truck_week_idx").on(table.truckId, table.weekStartDate),
  ]
);

export const odometerLogsRelations = relations(odometerLogs, ({ one }) => ({
  truck: one(trucks, { fields: [odometerLogs.truckId], references: [trucks.id] }),
}));

// ── Trips ───────────────────────────────────────────────────────────────────
export const trips = sqliteTable(
  "trips",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    truckId: integer("truck_id")
      .notNull()
      .references(() => trucks.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    fromCity: text("from_city").notNull(),
    fromState: text("from_state").notNull(),
    toCity: text("to_city").notNull(),
    toState: text("to_state").notNull(),
    trailer: text("trailer"),
    billNumber: text("bill_number"),
    amount: real("amount").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index("trips_truck_date_idx").on(table.truckId, table.date),
  ]
);

export const tripsRelations = relations(trips, ({ one }) => ({
  truck: one(trucks, { fields: [trips.truckId], references: [trucks.id] }),
}));

// ── Fuel Logs ───────────────────────────────────────────────────────────────
export const fuelLogs = sqliteTable(
  "fuel_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    truckId: integer("truck_id")
      .notNull()
      .references(() => trucks.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    gallons: real("gallons").notNull(),
    amount: real("amount").notNull(),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index("fuel_truck_date_idx").on(table.truckId, table.date),
  ]
);

export const fuelLogsRelations = relations(fuelLogs, ({ one }) => ({
  truck: one(trucks, { fields: [fuelLogs.truckId], references: [trucks.id] }),
}));

// ── Repairs ─────────────────────────────────────────────────────────────────
export const repairs = sqliteTable(
  "repairs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    truckId: integer("truck_id")
      .notNull()
      .references(() => trucks.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    repairTypeId: integer("repair_type_id")
      .notNull()
      .references(() => repairTypes.id),
    amount: real("amount").notNull(),
    notes: text("notes"),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index("repairs_truck_date_idx").on(table.truckId, table.date),
  ]
);

export const repairsRelations = relations(repairs, ({ one }) => ({
  truck: one(trucks, { fields: [repairs.truckId], references: [trucks.id] }),
  repairType: one(repairTypes, { fields: [repairs.repairTypeId], references: [repairTypes.id] }),
}));

// ── Repair Types ────────────────────────────────────────────────────────────
export const repairTypes = sqliteTable("repair_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  isDefault: integer("is_default").notNull().default(1),
});

export const repairTypesRelations = relations(repairTypes, ({ many }) => ({
  repairs: many(repairs),
}));

// ── Fixed Costs ─────────────────────────────────────────────────────────────
export const fixedCosts = sqliteTable(
  "fixed_costs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    truckId: integer("truck_id")
      .notNull()
      .references(() => trucks.id, { onDelete: "cascade" }),
    insurance: real("insurance").notNull().default(0),
    parking: real("parking").notNull().default(0),
    eld: real("eld").notNull().default(0),
    tolls: real("tolls").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("fixed_costs_truck_idx").on(table.truckId),
  ]
);

export const fixedCostsRelations = relations(fixedCosts, ({ one }) => ({
  truck: one(trucks, { fields: [fixedCosts.truckId], references: [trucks.id] }),
}));

// ── Custom Fixed Costs ──────────────────────────────────────────────────────
export const customFixedCosts = sqliteTable(
  "custom_fixed_costs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    truckId: integer("truck_id")
      .notNull()
      .references(() => trucks.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amount: real("amount").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  },
  (table) => [
    index("custom_fixed_costs_truck_idx").on(table.truckId),
  ]
);

export const customFixedCostsRelations = relations(customFixedCosts, ({ one }) => ({
  truck: one(trucks, { fields: [customFixedCosts.truckId], references: [trucks.id] }),
}));
