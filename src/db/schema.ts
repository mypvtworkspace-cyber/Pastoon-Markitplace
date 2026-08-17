import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean, jsonb } from 'drizzle-orm/pg-core';

// 1. Users Table (Linked via Firebase UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('customer'),
  avatar: text('avatar'),
  balance: doublePrecision('balance').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Businesses Table
export const businesses = pgTable('businesses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id').notNull(),
  ownerId: text('owner_id'),
  logo: text('logo'),
  rating: doublePrecision('rating').default(5.0),
  reviewCount: integer('review_count').default(0),
  isVerified: boolean('is_verified').default(false),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  registrationFeeStatus: text('registration_fee_status').default('paid'),
  commissionRate: doublePrecision('commission_rate').default(0.02),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Deals Table
export const deals = pgTable('deals', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  originalPrice: doublePrecision('original_price').notNull(),
  discountedPrice: doublePrecision('discounted_price').notNull(),
  discountPercentage: integer('discount_percentage').notNull(),
  categoryId: text('category_id').notNull(),
  businessId: text('business_id').notNull(),
  type: text('type').default('voucher'),
  status: text('status').default('active'),
  contentOrigin: text('content_origin').default('business'),
  qualityScore: integer('quality_score').default(85),
  commissionRate: doublePrecision('commission_rate').default(0.02),
  images: jsonb('images').$type<string[]>(),
  validUntil: text('valid_until'),
  terms: jsonb('terms').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Orders Table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  customerEmail: text('customer_email'),
  businessId: text('business_id').notNull(),
  status: text('status').default('confirmed'),
  totalAmount: doublePrecision('total_amount').notNull(),
  commissionAmount: doublePrecision('commission_amount').default(0),
  items: jsonb('items'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Workspace Integration Logs / Actions Table
export const workspaceLogs = pgTable('workspace_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  service: text('service').notNull(), // 'drive', 'gmail', 'chat', 'calendar', 'contacts'
  action: text('action').notNull(),
  status: text('status').default('success'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  logs: many(workspaceLogs),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  business: one(businesses, {
    fields: [deals.businessId],
    references: [businesses.id],
  }),
}));
