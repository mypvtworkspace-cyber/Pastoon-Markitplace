import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  initialSystemConfig,
  initialUsers,
  initialCategories,
  initialBusinesses,
  initialDeals,
  initialProductServices,
  initialCampaigns,
  initialOrders,
  initialReviews,
  initialKnowledgeBaseArticles,
  initialSupportTickets,
  initialAppUpdates,
  initialManagerInvitations,
  initialAdvertisements,
  initialBusinessRegistrations,
  initialUserRequests,
  initialCommunityReports,
} from './src/data/initialData';
import {
  User,
  Business,
  Category,
  Deal,
  Order,
  ProductServiceItem,
  Campaign,
  Review,
  SystemConfig,
  AuditLog,
  Notification,
  Booking,
  Conversation,
  ChatMessage,
  ChatModerationRequest,
  SupportTicket,
  SupportMessage,
  KnowledgeBaseArticle,
  ManagerInvitation,
  AppUpdate,
  Advertisement,
  BusinessRegistration,
  UserRequest,
  CommunityReport,
  ContentOrigin,
} from './src/types';

// In-Memory Database Store
let systemConfig: SystemConfig = { ...initialSystemConfig };
let users = [...initialUsers];
let categories: Category[] = [...initialCategories];
let businesses: Business[] = [...initialBusinesses];
let deals: Deal[] = [...initialDeals];
let productsAndServices: ProductServiceItem[] = [...initialProductServices];
let campaigns: Campaign[] = [...initialCampaigns];
let advertisements: Advertisement[] = [...initialAdvertisements];
let businessRegistrations: BusinessRegistration[] = [...initialBusinessRegistrations];
let userRequests: UserRequest[] = [...initialUserRequests];
let communityReports: CommunityReport[] = [...initialCommunityReports];
let orders: Order[] = [...initialOrders];
let reviews: Review[] = [...initialReviews];
let knowledgeBaseArticles: KnowledgeBaseArticle[] = [...initialKnowledgeBaseArticles];
let supportTickets: SupportTicket[] = [...initialSupportTickets];
let appUpdates: AppUpdate[] = [...initialAppUpdates];
let managerInvitations: ManagerInvitation[] = [...initialManagerInvitations];
let bookings: Booking[] = [];
let notifications: Notification[] = [];
let adClickLogs: { adId: string; ip: string; timestamp: number }[] = [];
let auditLogs: AuditLog[] = [
  {
    id: 'log_1',
    actorId: 'usr_admin_1',
    actorRole: 'owner',
    action: 'SYSTEM_BOOT',
    details: 'DealHub Phase 3 Universal Marketplace initialized with 2.0% platform commission & AI Support System.',
    timestamp: new Date().toISOString(),
  },
];

// In-Memory Chat Data Store
let conversations: Conversation[] = [
  {
    id: 'conv_1',
    customerId: 'usr_cust_1',
    customerName: 'Sarah Khan',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    businessId: 'biz_gourmet_1',
    businessName: 'Gourmet Bakers & Sweets',
    businessLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150',
    dealerOwnerId: 'usr_seller_1',
    lastMessageText: 'Hello! Is the 35% discount coupon valid for custom birthday cakes?',
    lastMessageTimestamp: new Date(Date.now() - 3600000).toISOString(),
    unreadCountCustomer: 0,
    unreadCountDealer: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let chatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'usr_cust_1',
    senderName: 'Sarah Khan',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    text: 'Hello! Is the 35% discount coupon valid for custom birthday cakes?',
    referencedDealId: 'deal_gourmet_1',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

let chatModerationRequests: ChatModerationRequest[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log helper
  const logAudit = (actorId: string, actorRole: string, action: string, details: string) => {
    auditLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  };

  // --- API ROUTES (/api/v1/...) ---

  // 1. System Config
  app.get('/api/v1/system/config', (req, res) => {
    res.json({ success: true, data: systemConfig });
  });

  app.put('/api/v1/system/config', (req, res) => {
    const {
      defaultCommissionRate,
      verifiedCommissionRate,
      standardCommissionRate,
      platformRegistrationFeeRate,
      baseBusinessRegistrationFee,
      legalTaxRate,
      currencySymbol,
      currencyCode,
    } = req.body;

    if (typeof defaultCommissionRate === 'number') systemConfig.defaultCommissionRate = defaultCommissionRate;
    if (typeof verifiedCommissionRate === 'number') systemConfig.verifiedCommissionRate = verifiedCommissionRate;
    if (typeof standardCommissionRate === 'number') systemConfig.standardCommissionRate = standardCommissionRate;
    if (typeof platformRegistrationFeeRate === 'number') systemConfig.platformRegistrationFeeRate = platformRegistrationFeeRate;
    if (typeof baseBusinessRegistrationFee === 'number') systemConfig.baseBusinessRegistrationFee = baseBusinessRegistrationFee;
    if (typeof legalTaxRate === 'number') systemConfig.legalTaxRate = legalTaxRate;
    if (currencySymbol) systemConfig.currencySymbol = currencySymbol;
    if (currencyCode) systemConfig.currencyCode = currencyCode;

    logAudit('usr_admin_1', 'admin', 'UPDATE_CONFIG', `Updated system fees: Verified 2%, Standard 6%, Platform Reg Charge ${(systemConfig.platformRegistrationFeeRate * 100).toFixed(1)}%`);
    res.json({ success: true, data: systemConfig, message: 'System configuration updated successfully' });
  });

  // 2. Categories
  app.get('/api/v1/categories', (req, res) => {
    res.json({ success: true, data: categories });
  });

  app.post('/api/v1/categories', (req, res) => {
    const { name, icon, description, subcategories } = req.body;
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: icon || 'Tag',
      description: description || '',
      displayOrder: categories.length + 1,
      subcategories: (subcategories || []).map((subName: string, idx: number) => ({
        id: `sub_${Date.now()}_${idx}`,
        categoryId: `cat_${Date.now()}`,
        name: subName,
        slug: subName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
    };
    categories.push(newCat);
    logAudit('usr_admin_1', 'admin', 'CREATE_CATEGORY', `Created category ${name}`);
    res.json({ success: true, data: newCat });
  });

  app.put('/api/v1/categories/:id', (req, res) => {
    const { id } = req.params;
    const catIndex = categories.findIndex((c) => c.id === id);
    if (catIndex === -1) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    categories[catIndex] = { ...categories[catIndex], ...req.body };
    res.json({ success: true, data: categories[catIndex] });
  });

  // 3. Business Registrations & 3% DealHub Platform Registration Charge Workflow
  app.get('/api/v1/business-registrations', (req, res) => {
    const { ownerId, status } = req.query;
    let result = [...businessRegistrations];
    if (ownerId) result = result.filter((r) => r.ownerId === ownerId);
    if (status) result = result.filter((r) => r.status === status);
    res.json({ success: true, data: result, total: result.length });
  });

  app.post('/api/v1/business-registrations', (req, res) => {
    const {
      ownerId,
      ownerName,
      businessName,
      category,
      categoryId,
      phone,
      email,
      whatsapp,
      location,
      openingHours,
      description,
      verificationDocUrl,
      paymentMethod,
      paymentProofRef,
    } = req.body;

    if (!businessName || !phone || !email) {
      res.status(400).json({ success: false, message: 'Missing required business registration fields.' });
      return;
    }

    // Secure Server-Side 3% Platform Registration Charge Calculation
    const baseRegistrationFee = systemConfig.baseBusinessRegistrationFee || 10000;
    const platformRegistrationChargeRate = systemConfig.platformRegistrationFeeRate || 0.03; // 3% Platform Fee
    const platformRegistrationChargeAmount = Number((baseRegistrationFee * platformRegistrationChargeRate).toFixed(2));
    
    // Separate Legal / Government Tax calculation (strictly distinguished from DealHub fee)
    const legalTaxRate = systemConfig.legalTaxRate || 0.00;
    const legalTaxAmount = Number((baseRegistrationFee * legalTaxRate).toFixed(2));
    const totalAmountPayable = Number((baseRegistrationFee + platformRegistrationChargeAmount + legalTaxAmount).toFixed(2));

    const newReg: BusinessRegistration = {
      id: `breg_${Date.now()}`,
      ownerId: ownerId || 'usr_seller_1',
      ownerName: ownerName || 'Business Owner',
      businessName,
      category: category || 'General Business',
      categoryId: categoryId || 'cat_general',
      phone,
      email,
      whatsapp: whatsapp || phone,
      location: location || {
        country: 'Pakistan',
        state: 'Punjab',
        city: 'Lahore',
        area: 'Commercial Area',
        address: 'Main Boulevard',
      },
      openingHours: openingHours || '09:00 AM - 09:00 PM',
      description: description || '',
      verificationDocUrl,
      baseRegistrationFee,
      platformRegistrationChargeRate,
      platformRegistrationChargeAmount,
      legalTaxRate,
      legalTaxAmount,
      totalAmountPayable,
      paymentMethod: paymentMethod || 'Bank Transfer / Mobile Wallet',
      paymentStatus: paymentProofRef ? 'payment_submitted' : 'payment_pending',
      paymentProofRef,
      status: paymentProofRef ? 'under_review' : 'payment_pending',
      createdAt: new Date().toISOString(),
    };

    businessRegistrations.unshift(newReg);

    logAudit(
      newReg.ownerId,
      'seller',
      'SUBMIT_BUSINESS_REGISTRATION',
      `Business registration submitted for ${businessName}. Total Payable: Rs. ${totalAmountPayable} (Base: Rs. ${baseRegistrationFee} + DealHub 3% Fee: Rs. ${platformRegistrationChargeAmount})`
    );

    res.json({
      success: true,
      data: newReg,
      message: 'Business registration submitted successfully. Please complete payment verification.',
    });
  });

  app.put('/api/v1/business-registrations/:id/payment', (req, res) => {
    const { id } = req.params;
    const { paymentMethod, paymentProofRef } = req.body;
    const reg = businessRegistrations.find((r) => r.id === id);

    if (!reg) {
      res.status(404).json({ success: false, message: 'Registration record not found' });
      return;
    }

    if (paymentMethod) reg.paymentMethod = paymentMethod;
    if (paymentProofRef) reg.paymentProofRef = paymentProofRef;
    reg.paymentStatus = 'payment_submitted';
    reg.status = 'under_review';

    logAudit(reg.ownerId, 'seller', 'SUBMIT_PAYMENT_PROOF', `Submitted payment proof for registration #${id}: ${paymentProofRef}`);
    res.json({ success: true, data: reg, message: 'Payment reference submitted for administrative verification.' });
  });

  app.put('/api/v1/business-registrations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus, adminReviewNotes, adminId } = req.body;
    const reg = businessRegistrations.find((r) => r.id === id);

    if (!reg) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    if (status) reg.status = status;
    if (paymentStatus) reg.paymentStatus = paymentStatus;
    if (adminReviewNotes) reg.adminReviewNotes = adminReviewNotes;

    // If approved, create or activate business in directory
    if (status === 'approved') {
      reg.approvedAt = new Date().toISOString();
      reg.approvedBy = adminId || 'usr_admin_1';
      reg.paymentStatus = 'payment_verified';

      // Check if business already exists
      let biz = businesses.find((b) => b.ownerId === reg.ownerId || b.name.toLowerCase() === reg.businessName.toLowerCase());
      if (!biz) {
        biz = {
          id: `biz_${Date.now()}`,
          ownerId: reg.ownerId,
          name: reg.businessName,
          logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
          coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
          description: reg.description,
          categoryId: reg.categoryId,
          subcategoryId: '',
          planId: 'professional',
          location: reg.location,
          contact: {
            phone: reg.phone,
            email: reg.email,
            whatsapp: reg.whatsapp,
          },
          openingHours: reg.openingHours,
          rating: 5.0,
          reviewCount: 0,
          isVerified: true,
          verificationDocUrl: reg.verificationDocUrl,
          followersCount: 1,
          featured: true,
          createdAt: new Date().toISOString(),
        };
        businesses.push(biz);
      } else {
        biz.isVerified = true;
      }
    }

    logAudit(
      adminId || 'usr_admin_1',
      'admin',
      'UPDATE_BUSINESS_REGISTRATION_STATUS',
      `Registration #${id} (${reg.businessName}) status updated to ${status} (Payment: ${reg.paymentStatus})`
    );

    res.json({ success: true, data: reg, message: `Registration status updated to ${status}` });
  });

  // 4. Businesses
  app.get('/api/v1/businesses', (req, res) => {
    const { category, city, search, verified, featured } = req.query;
    let result = [...businesses];

    if (category) {
      result = result.filter((b) => b.categoryId === category);
    }
    if (city) {
      result = result.filter((b) => b.location.city.toLowerCase() === (city as string).toLowerCase());
    }
    if (verified === 'true') {
      result = result.filter((b) => b.isVerified);
    }
    if (featured === 'true') {
      result = result.filter((b) => b.featured);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.location.area.toLowerCase().includes(q));
    }

    res.json({ success: true, data: result, total: result.length });
  });

  app.get('/api/v1/businesses/:id', (req, res) => {
    const biz = businesses.find((b) => b.id === req.params.id);
    if (!biz) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    const bizDeals = deals.filter((d) => d.businessId === biz.id);
    const bizProducts = productsAndServices.filter((p) => p.businessId === biz.id);
    const bizReviews = reviews.filter((r) => r.businessId === biz.id);

    res.json({
      success: true,
      data: {
        ...biz,
        deals: bizDeals,
        productsAndServices: bizProducts,
        reviews: bizReviews,
      },
    });
  });

  app.post('/api/v1/businesses', (req, res) => {
    const newBiz: Business = {
      id: `biz_${Date.now()}`,
      ownerId: req.body.ownerId || 'usr_seller_1',
      name: req.body.name,
      logo: req.body.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      coverImage: req.body.coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      description: req.body.description,
      categoryId: req.body.categoryId,
      subcategoryId: req.body.subcategoryId || '',
      planId: req.body.planId || 'free',
      location: req.body.location || { country: 'Pakistan', state: 'Punjab', city: 'Lahore', area: 'Gulberg', address: 'Main Street' },
      contact: req.body.contact || { phone: '+92 300 0000000', email: 'biz@example.com' },
      openingHours: req.body.openingHours || '09:00 AM - 09:00 PM',
      rating: 5.0,
      reviewCount: 0,
      isVerified: false,
      followersCount: 1,
      featured: false,
      createdAt: new Date().toISOString(),
    };
    businesses.push(newBiz);
    logAudit(newBiz.ownerId, 'seller', 'CREATE_BUSINESS', `Registered new business ${newBiz.name}`);
    res.json({ success: true, data: newBiz });
  });

  app.put('/api/v1/businesses/:id/verify', (req, res) => {
    const bizIndex = businesses.findIndex((b) => b.id === req.params.id);
    if (bizIndex === -1) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    businesses[bizIndex].isVerified = req.body.isVerified ?? true;
    logAudit('usr_admin_1', 'admin', 'VERIFY_BUSINESS', `Updated verification status for ${businesses[bizIndex].name} to ${businesses[bizIndex].isVerified}`);
    res.json({ success: true, data: businesses[bizIndex] });
  });

  // 5. Deals & Organic User Submissions (Verified: 2% commission, Standard/Unverified: 6% commission)
  app.get('/api/v1/deals', (req, res) => {
    const { category, isFlash, isSponsored, isVerified, contentOrigin, city, search, dealType, status } = req.query;
    let result = [...deals];

    // Filter out removed / expired deals for public views unless admin
    if (status) {
      result = result.filter((d) => d.status === status);
    } else {
      result = result.filter((d) => !d.status || d.status === 'published' || d.status === 'approved' || d.status === 'verified');
    }

    if (category) {
      result = result.filter((d) => d.categoryId === category);
    }
    if (isFlash === 'true') {
      result = result.filter((d) => d.isFlashDeal && new Date(d.endDate) > new Date());
    }
    if (isSponsored === 'true') {
      result = result.filter((d) => d.isSponsored);
    }
    if (isVerified === 'true') {
      result = result.filter((d) => d.isVerified);
    }
    if (contentOrigin) {
      result = result.filter((d) => (d.contentOrigin || 'business') === contentOrigin);
    }
    if (dealType) {
      result = result.filter((d) => d.dealType === dealType);
    }
    if (city) {
      const bizIdsInCity = businesses.filter((b) => b.location.city.toLowerCase() === (city as string).toLowerCase()).map((b) => b.id);
      result = result.filter((d) => bizIdsInCity.includes(d.businessId));
    }
    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }

    res.json({ success: true, data: result, total: result.length });
  });

  app.post('/api/v1/deals', (req, res) => {
    const {
      businessId,
      sellerName,
      title,
      description,
      originalPrice,
      discountedPrice,
      dealType,
      contentOrigin,
      isFlashDeal,
      endDate,
      totalQuantity,
      categoryId,
      subcategoryId,
      images,
      termsAndConditions,
      redemptionMethod,
      submittedByUserId,
    } = req.body;

    // Backend Pricing and Discount Validation
    const orig = Number(originalPrice);
    const disc = Number(discountedPrice);

    if (!title || isNaN(orig) || isNaN(disc) || orig <= 0 || disc <= 0 || disc >= orig) {
      res.status(400).json({
        success: false,
        message: 'Invalid pricing parameters: Original price must be greater than discounted price.',
      });
      return;
    }

    // Spam / Duplicate check
    const duplicate = deals.find(
      (d) => d.title.toLowerCase().trim() === title.toLowerCase().trim() && (Date.now() - new Date(d.createdAt).getTime()) < 300000
    );
    if (duplicate) {
      res.status(429).json({
        success: false,
        message: 'Duplicate submission detected. Please wait before submitting identical content.',
      });
      return;
    }

    const discountPercentage = Math.round(((orig - disc) / orig) * 100);
    const origin: ContentOrigin = contentOrigin || 'business';

    // Verification & Commission Engine: Verified gets 2%, Non-Verified/Organic gets 6%
    const biz = businesses.find((b) => b.id === businessId);
    const isVerified = origin === 'business' ? (biz ? biz.isVerified : false) : false;
    const commissionRate = isVerified ? (systemConfig.verifiedCommissionRate || 0.02) : (systemConfig.standardCommissionRate || 0.06);

    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      businessId: businessId || 'biz_community',
      sellerName: sellerName || (biz ? biz.name : 'Community Member'),
      title,
      description: description || '',
      originalPrice: orig,
      discountedPrice: disc,
      discountPercentage,
      dealType: dealType || 'physical_product',
      contentOrigin: origin,
      isFlashDeal: !!isFlashDeal,
      isVerified,
      commissionRate,
      status: 'published',
      qualityScore: Math.min(95, 70 + (images?.length || 1) * 5 + (description?.length > 50 ? 10 : 0)),
      submittedByUserId: submittedByUserId || 'usr_cust_1',
      startDate: new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      totalQuantity: totalQuantity || 50,
      remainingQuantity: totalQuantity || 50,
      maxPerCustomer: 5,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'],
      termsAndConditions: termsAndConditions || 'Show voucher code upon redemption.',
      redemptionMethod: redemptionMethod || 'in_store_voucher',
      redemptionCode: `DH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      categoryId: categoryId || 'cat_restaurants',
      subcategoryId: subcategoryId || '',
      isSponsored: false,
      viewsCount: 0,
      clicksCount: 0,
      purchasesCount: 0,
      createdAt: new Date().toISOString(),
    };

    deals.unshift(newDeal);

    logAudit(
      submittedByUserId || 'user',
      origin === 'business' ? 'seller' : 'user',
      'CREATE_DEAL',
      `Submitted deal: ${title} (${discountPercentage}% off). Origin: ${origin}, Verified: ${isVerified}, Commission: ${(commissionRate * 100).toFixed(1)}%`
    );

    res.json({
      success: true,
      data: newDeal,
      message: `Deal created successfully! Commission rate set to ${(commissionRate * 100).toFixed(1)}% (${isVerified ? 'Verified 2%' : 'Standard 6%'}).`,
    });
  });

  app.put('/api/v1/deals/:id/verify', (req, res) => {
    const { id } = req.params;
    const { isVerified, adminId } = req.body;
    const deal = deals.find((d) => d.id === id);

    if (!deal) {
      res.status(404).json({ success: false, message: 'Deal not found' });
      return;
    }

    deal.isVerified = !!isVerified;
    deal.commissionRate = deal.isVerified ? (systemConfig.verifiedCommissionRate || 0.02) : (systemConfig.standardCommissionRate || 0.06);

    logAudit(
      adminId || 'usr_admin_1',
      'admin',
      'VERIFY_DEAL',
      `Deal #${id} (${deal.title}) verification set to ${deal.isVerified}. Commission rate updated to ${(deal.commissionRate * 100).toFixed(1)}%`
    );

    res.json({ success: true, data: deal, message: `Deal verification updated (${(deal.commissionRate * 100).toFixed(1)}% commission applied).` });
  });

  app.put('/api/v1/deals/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, adminId, reason } = req.body;
    const deal = deals.find((d) => d.id === id);

    if (!deal) {
      res.status(404).json({ success: false, message: 'Deal not found' });
      return;
    }

    deal.status = status;

    logAudit(
      adminId || 'usr_admin_1',
      'admin',
      'MODERATE_DEAL',
      `Deal #${id} status changed to ${status}. Reason: ${reason || 'Admin action'}`
    );

    res.json({ success: true, data: deal, message: `Deal status updated to ${status}` });
  });

  app.post('/api/v1/deals/:id/track-click', (req, res) => {
    const deal = deals.find((d) => d.id === req.params.id);
    if (deal) {
      deal.clicksCount += 1;
      deal.viewsCount += 1;
    }
    res.json({ success: true });
  });

  // 6. Advertisements, Anti-Fraud Click Engine, Quality Score & Rotation System
  app.get('/api/v1/advertisements', (req, res) => {
    const { businessId, status, category, location } = req.query;
    let result = [...advertisements];

    if (businessId) result = result.filter((a) => a.businessId === businessId);
    if (status) result = result.filter((a) => a.status === status);
    if (category) result = result.filter((a) => a.categoryId === category);
    if (location) result = result.filter((a) => a.targetLocation.toLowerCase().includes((location as string).toLowerCase()));

    res.json({ success: true, data: result, total: result.length });
  });

  // Rotation Engine: Returns active, paid, high-quality approved advertisements
  app.get('/api/v1/advertisements/active', (req, res) => {
    const { category, city } = req.query;
    let activeAds = advertisements.filter(
      (a) => (a.status === 'published' || a.status === 'approved') && a.spentAmount < a.campaignBudget && new Date(a.endDate) > new Date()
    );

    if (category && category !== 'all') {
      activeAds = activeAds.filter((a) => !a.targetCategory || a.targetCategory === category || a.categoryId === category);
    }
    if (city && city !== 'All') {
      activeAds = activeAds.filter((a) => !a.targetLocation || a.targetLocation.toLowerCase() === (city as string).toLowerCase() || a.targetLocation === 'All');
    }

    // Sort by Quality Score and Budget Pacing for fair rotation
    activeAds.sort((a, b) => b.qualityScore - a.qualityScore);

    res.json({ success: true, data: activeAds, total: activeAds.length });
  });

  app.post('/api/v1/advertisements', (req, res) => {
    const {
      businessId,
      title,
      category,
      categoryId,
      description,
      images,
      promotionalBadge,
      discountDetails,
      startDate,
      endDate,
      targetLocation,
      targetCategory,
      contactMethod,
      externalDestination,
      campaignBudget,
      paymentReference,
    } = req.body;

    const biz = businesses.find((b) => b.id === businessId);
    const bizName = biz ? biz.name : 'DealHub Business Partner';

    // Calculate Internal Quality Score (0-100)
    let qualityScore = 70;
    if (biz?.isVerified) qualityScore += 10;
    if (images && images.length >= 2) qualityScore += 10;
    if (description && description.length >= 60) qualityScore += 5;
    if (discountDetails) qualityScore += 5;

    const newAd: Advertisement = {
      id: `ad_${Date.now()}`,
      businessId: businessId || 'biz_general',
      businessName: bizName,
      businessLogo: biz?.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      title: title || 'Exclusive DealHub Promotion',
      category: category || 'General',
      categoryId: categoryId || 'cat_general',
      description: description || '',
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'],
      promotionalBadge: promotionalBadge || 'Featured Promotion',
      discountDetails,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      targetLocation: targetLocation || 'All',
      targetCategory,
      contactMethod: contactMethod || 'DealHub Direct Communication',
      externalDestination,
      campaignBudget: Number(campaignBudget) || 20000,
      spentAmount: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      qualityScore,
      status: paymentReference ? 'under_review' : 'payment_pending',
      paymentStatus: paymentReference ? 'submitted' : 'pending',
      paymentReference,
      createdAt: new Date().toISOString(),
    };

    advertisements.unshift(newAd);

    logAudit(
      biz?.ownerId || 'seller',
      'seller',
      'SUBMIT_ADVERTISEMENT',
      `Submitted advertisement: "${title}" (Budget: Rs. ${newAd.campaignBudget}, Quality Score: ${qualityScore}). Payment Status: ${newAd.paymentStatus}`
    );

    res.json({
      success: true,
      data: newAd,
      message: 'Advertisement submitted. Requires payment confirmation & owner review before publication.',
    });
  });

  app.put('/api/v1/advertisements/:id/payment', (req, res) => {
    const { id } = req.params;
    const { paymentReference } = req.body;
    const ad = advertisements.find((a) => a.id === id);

    if (!ad) {
      res.status(404).json({ success: false, message: 'Advertisement not found' });
      return;
    }

    ad.paymentReference = paymentReference;
    ad.paymentStatus = 'submitted';
    ad.status = 'under_review';

    logAudit(ad.businessId, 'seller', 'SUBMIT_AD_PAYMENT', `Payment reference submitted for Ad #${id}: ${paymentReference}`);
    res.json({ success: true, data: ad, message: 'Payment reference submitted for review.' });
  });

  app.put('/api/v1/advertisements/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus, adminId, qualityScore } = req.body;
    const ad = advertisements.find((a) => a.id === id);

    if (!ad) {
      res.status(404).json({ success: false, message: 'Advertisement not found' });
      return;
    }

    if (status) ad.status = status;
    if (paymentStatus) ad.paymentStatus = paymentStatus;
    if (typeof qualityScore === 'number') ad.qualityScore = qualityScore;
    ad.updatedAt = new Date().toISOString();

    logAudit(
      adminId || 'usr_admin_1',
      'admin',
      'UPDATE_AD_STATUS',
      `Advertisement #${id} status changed to ${status} (Payment: ${ad.paymentStatus})`
    );

    res.json({ success: true, data: ad, message: `Advertisement status updated to ${status}` });
  });

  // Anti-Fraud Click Engine with Timestamp & Session Validation
  app.post('/api/v1/advertisements/:id/click', (req, res) => {
    const { id } = req.params;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    // Check for rapid click spam from same IP (within 10 seconds)
    const recentClick = adClickLogs.find(
      (log) => log.adId === id && log.ip === clientIp && (now - log.timestamp) < 10000
    );

    const ad = advertisements.find((a) => a.id === id);
    if (!ad) {
      res.status(404).json({ success: false, message: 'Ad not found' });
      return;
    }

    if (recentClick) {
      // Fraud prevention: Ignore spam clicks, don't charge budget
      res.json({ success: true, isSpamFiltered: true });
      return;
    }

    // Legitimate Click
    adClickLogs.push({ adId: id, ip: String(clientIp), timestamp: now });
    if (adClickLogs.length > 500) adClickLogs.shift();

    ad.clicks += 1;
    ad.spentAmount = Math.min(ad.campaignBudget, ad.spentAmount + 15); // Rs. 15 CPC

    res.json({ success: true, validClick: true });
  });

  app.post('/api/v1/advertisements/:id/impression', (req, res) => {
    const { id } = req.params;
    const ad = advertisements.find((a) => a.id === id);
    if (ad && ad.status === 'published') {
      ad.impressions += 1;
      ad.spentAmount = Math.min(ad.campaignBudget, ad.spentAmount + 0.25); // Rs. 0.25 CPM share
    }
    res.json({ success: true });
  });

  // 7. Apply / Request System for Deals & Services
  app.get('/api/v1/requests', (req, res) => {
    const { userId, sellerOrBusinessId, status, targetId } = req.query;
    let result = [...userRequests];

    if (userId) result = result.filter((r) => r.userId === userId);
    if (sellerOrBusinessId) result = result.filter((r) => r.sellerOrBusinessId === sellerOrBusinessId);
    if (status) result = result.filter((r) => r.status === status);
    if (targetId) result = result.filter((r) => r.targetId === targetId);

    res.json({ success: true, data: result, total: result.length });
  });

  app.post('/api/v1/requests', (req, res) => {
    const {
      userId,
      userName,
      userEmail,
      userPhone,
      sellerOrBusinessId,
      sellerOrBusinessName,
      targetType,
      targetId,
      targetTitle,
      requestType,
      message,
      proposedBudget,
      requestedDate,
      requestedTimeSlot,
    } = req.body;

    if (!targetId || !message) {
      res.status(400).json({ success: false, message: 'Target ID and description message are required.' });
      return;
    }

    const newReq: UserRequest = {
      id: `req_${Date.now()}`,
      requestNumber: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId || 'usr_cust_1',
      userName: userName || 'Valued Customer',
      userEmail: userEmail || 'customer@dealhub.app',
      userPhone: userPhone || '+92 300 0000000',
      sellerOrBusinessId: sellerOrBusinessId || 'biz_general',
      sellerOrBusinessName: sellerOrBusinessName || 'Partner Seller',
      targetType: targetType || 'deal',
      targetId,
      targetTitle: targetTitle || 'Marketplace Item',
      requestType: requestType || 'deal_application',
      message,
      proposedBudget: proposedBudget ? Number(proposedBudget) : undefined,
      requestedDate,
      requestedTimeSlot,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userRequests.unshift(newReq);

    // Create In-App Notification for seller
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: newReq.sellerOrBusinessId,
      title: `New Customer Request (#${newReq.requestNumber})`,
      message: `${newReq.userName} submitted an application for ${newReq.targetTitle}`,
      type: 'order_update',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    logAudit(
      newReq.userId,
      'customer',
      'SUBMIT_REQUEST',
      `Submitted request #${newReq.requestNumber} for ${newReq.targetTitle} to ${newReq.sellerOrBusinessName}`
    );

    res.json({
      success: true,
      data: newReq,
      message: 'Your request / application has been submitted to the dealer successfully!',
    });
  });

  app.put('/api/v1/requests/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, sellerResponseNote, actorId } = req.body;
    const userReq = userRequests.find((r) => r.id === id);

    if (!userReq) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    if (status) userReq.status = status;
    if (sellerResponseNote !== undefined) userReq.sellerResponseNote = sellerResponseNote;
    userReq.updatedAt = new Date().toISOString();

    // Create In-App Notification for requester
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: userReq.userId,
      title: `Request #${userReq.requestNumber} Status: ${status.toUpperCase()}`,
      message: `${userReq.sellerOrBusinessName} updated your application status to ${status}.${sellerResponseNote ? ` Note: "${sellerResponseNote}"` : ''}`,
      type: 'order_update',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    logAudit(
      actorId || userReq.sellerOrBusinessId,
      'seller',
      'UPDATE_REQUEST_STATUS',
      `Request #${userReq.requestNumber} updated to ${status}. Note: ${sellerResponseNote || 'None'}`
    );

    res.json({ success: true, data: userReq, message: `Request status updated to ${status}` });
  });

  // 8. User Reporting System & Anti-Fake Product Queue
  app.get('/api/v1/reports', (req, res) => {
    const { status, riskLevel, targetType } = req.query;
    let result = [...communityReports];

    if (status) result = result.filter((r) => r.status === status);
    if (riskLevel) result = result.filter((r) => r.riskLevel === riskLevel);
    if (targetType) result = result.filter((r) => r.targetType === targetType);

    res.json({ success: true, data: result, total: result.length });
  });

  app.post('/api/v1/reports', (req, res) => {
    const {
      reportedByUserId,
      reportedByUserName,
      targetType,
      targetId,
      targetTitle,
      businessId,
      reasonCategory,
      description,
      evidenceUrls,
    } = req.body;

    if (!targetId || !reasonCategory) {
      res.status(400).json({ success: false, message: 'Target ID and reason category are required.' });
      return;
    }

    // Automated Risk Classification
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (reasonCategory === 'scam' || reasonCategory === 'fake_product') riskLevel = 'high';
    if (description?.toLowerCase().includes('counterfeit') || description?.toLowerCase().includes('pyramid')) riskLevel = 'critical';

    const newReport: CommunityReport = {
      id: `rep_${Date.now()}`,
      reportedByUserId: reportedByUserId || 'usr_cust_1',
      reportedByUserName: reportedByUserName || 'Community Member',
      targetType: targetType || 'deal',
      targetId,
      targetTitle: targetTitle || 'Reported Content',
      businessId,
      reasonCategory,
      description: description || '',
      evidenceUrls: evidenceUrls || [],
      riskLevel,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };

    communityReports.unshift(newReport);

    logAudit(
      newReport.reportedByUserId,
      'user',
      'SUBMIT_COMMUNITY_REPORT',
      `Reported ${targetType} "${targetTitle}" for ${reasonCategory}. Risk Level: ${riskLevel}`
    );

    res.json({
      success: true,
      data: newReport,
      message: 'Thank you for protecting DealHub marketplace. Your report has been dispatched to security moderation queue.',
    });
  });

  app.put('/api/v1/reports/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { status, adminNotes, actionTaken, adminId } = req.body;
    const report = communityReports.find((r) => r.id === id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report record not found' });
      return;
    }

    report.status = status || 'resolved_removed';
    if (adminNotes) report.adminNotes = adminNotes;
    report.reviewedByAdminId = adminId || 'usr_admin_1';
    report.resolvedAt = new Date().toISOString();

    // If action taken is to remove listing
    if (actionTaken === 'remove_target') {
      if (report.targetType === 'deal') {
        const d = deals.find((deal) => deal.id === report.targetId);
        if (d) d.status = 'removed';
      } else if (report.targetType === 'advertisement') {
        const a = advertisements.find((ad) => ad.id === report.targetId);
        if (a) a.status = 'removed';
      }
    }

    logAudit(
      adminId || 'usr_admin_1',
      'admin',
      'RESOLVE_COMMUNITY_REPORT',
      `Resolved report #${id} (${report.reasonCategory}) with status ${report.status}. Action: ${actionTaken || 'None'}`
    );

    res.json({ success: true, data: report, message: 'Report moderation resolved successfully.' });
  });

  // 5. Products and Services
  app.get('/api/v1/products-services', (req, res) => {
    const { type, businessId, category } = req.query;
    let result = [...productsAndServices];
    if (type) result = result.filter((p) => p.type === type);
    if (businessId) result = result.filter((p) => p.businessId === businessId);
    if (category) result = result.filter((p) => p.categoryId === category);
    res.json({ success: true, data: result });
  });

  app.post('/api/v1/products-services', (req, res) => {
    const newItem: ProductServiceItem = {
      id: `ps_${Date.now()}`,
      businessId: req.body.businessId,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type || 'product',
      price: req.body.price,
      categoryId: req.body.categoryId,
      subcategoryId: req.body.subcategoryId || '',
      images: req.body.images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
      inStock: true,
      serviceDurationMinutes: req.body.serviceDurationMinutes,
      timeSlots: req.body.timeSlots,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    productsAndServices.push(newItem);
    res.json({ success: true, data: newItem });
  });

  // 6. Orders & 2% Commission Calculation Engine
  app.get('/api/v1/orders', (req, res) => {
    const { customerId, businessId } = req.query;
    let result = [...orders];
    if (customerId) result = result.filter((o) => o.customerId === customerId);
    if (businessId) result = result.filter((o) => o.businessId === businessId);
    res.json({ success: true, data: result });
  });

  app.post('/api/v1/orders', (req, res) => {
    const { customerId, customerName, customerEmail, customerPhone, businessId, items, paymentMethod, bookingDate, bookingTimeSlot } = req.body;

    const biz = businesses.find((b) => b.id === businessId);
    const bizName = biz ? biz.name : 'DealHub Partner';

    let subtotal = 0;
    const formattedItems = (items || []).map((item: any) => {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        dealId: item.dealId,
        productId: item.productId,
        serviceId: item.serviceId,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: lineTotal,
        type: item.type || 'deal',
      };
    });

    // Commission Engine Calculation: 2% for Verified, 6% for Non-Verified
    const isVerifiedOrder = biz?.isVerified || formattedItems.some((it: any) => {
      if (it.dealId) {
        const d = deals.find((deal) => deal.id === it.dealId);
        return d?.isVerified;
      }
      return false;
    });

    const commissionRate = isVerifiedOrder
      ? (systemConfig.verifiedCommissionRate || 0.02)
      : (systemConfig.standardCommissionRate || 0.06);

    const platformCommissionAmount = Number((subtotal * commissionRate).toFixed(2));
    const sellerGrossSettlement = Number((subtotal - platformCommissionAmount).toFixed(2));
    const voucherCode = `DH-VOUCHER-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `DH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: customerId || 'usr_cust_1',
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'customer@example.com',
      customerPhone: customerPhone || '+92 300 0000000',
      businessId,
      businessName: bizName,
      items: formattedItems,
      subtotal,
      platformCommissionRate: commissionRate,
      platformCommissionAmount,
      taxesAmount: 0,
      sellerGrossSettlement,
      totalAmount: subtotal,
      status: 'confirmed',
      paymentMethod: paymentMethod || 'easypaisa_jazzcash',
      paymentStatus: 'paid',
      redemptionVoucherCode: voucherCode,
      isRedeemed: false,
      bookingDate,
      bookingTimeSlot,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    // Update quantities on deal purchases
    formattedItems.forEach((it: any) => {
      if (it.dealId) {
        const d = deals.find((deal) => deal.id === it.dealId);
        if (d) {
          d.remainingQuantity = Math.max(0, d.remainingQuantity - it.quantity);
          d.purchasesCount += it.quantity;
        }
      }
    });

    // Create booking record if slot specified
    if (bookingDate && bookingTimeSlot) {
      bookings.push({
        id: `bk_${Date.now()}`,
        orderId: newOrder.id,
        serviceId: formattedItems[0]?.serviceId || formattedItems[0]?.dealId || 'srv_general',
        serviceTitle: formattedItems[0]?.title || 'Service Booking',
        businessId,
        businessName: bizName,
        customerId: newOrder.customerId,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
    }

    logAudit(
      newOrder.customerId,
      'customer',
      'CREATE_ORDER',
      `Order #${newOrder.orderNumber} created for Rs. ${subtotal}. Platform 2% Commission: Rs. ${platformCommissionAmount}. Seller Net: Rs. ${sellerGrossSettlement}`
    );

    res.json({
      success: true,
      data: newOrder,
      message: 'Order created successfully! 2% platform commission auto-calculated.',
    });
  });

  app.put('/api/v1/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    order.status = status;
    if (status === 'completed' && order.redemptionVoucherCode) {
      order.isRedeemed = true;
    }
    logAudit('usr_admin_1', 'admin', 'UPDATE_ORDER_STATUS', `Order #${order.orderNumber} status changed to ${status}`);
    res.json({ success: true, data: order });
  });

  // 7. Bookings
  app.get('/api/v1/bookings', (req, res) => {
    res.json({ success: true, data: bookings });
  });

  // 8. Sponsorship Campaigns
  app.get('/api/v1/campaigns', (req, res) => {
    const { sponsorId, type } = req.query;
    let result = [...campaigns];
    if (sponsorId) result = result.filter((c) => c.sponsorId === sponsorId);
    if (type) result = result.filter((c) => c.type === type);
    res.json({ success: true, data: result });
  });

  app.post('/api/v1/campaigns', (req, res) => {
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      sponsorId: req.body.sponsorId || 'usr_sponsor_1',
      sponsorName: req.body.sponsorName || 'DealHub Sponsor',
      campaignName: req.body.campaignName,
      type: req.body.type || 'homepage_banner',
      budget: req.body.budget || 50000,
      spentAmount: 0,
      bannerImage: req.body.bannerImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
      title: req.body.title,
      tagline: req.body.tagline || '',
      landingUrl: req.body.landingUrl || '/deals',
      startDate: new Date().toISOString(),
      endDate: req.body.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'active',
      impressions: 1,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };
    campaigns.push(newCamp);
    logAudit(newCamp.sponsorId, 'sponsor', 'CREATE_CAMPAIGN', `Created campaign: ${newCamp.campaignName} (Budget: Rs. ${newCamp.budget})`);
    res.json({ success: true, data: newCamp });
  });

  app.post('/api/v1/campaigns/:id/track', (req, res) => {
    const { action } = req.body; // 'impression' or 'click'
    const camp = campaigns.find((c) => c.id === req.params.id);
    if (camp) {
      if (action === 'click') {
        camp.clicks += 1;
        camp.spentAmount = Math.min(camp.budget, camp.spentAmount + 15);
      } else {
        camp.impressions += 1;
        camp.spentAmount = Math.min(camp.budget, camp.spentAmount + 0.5);
      }
    }
    res.json({ success: true });
  });

  // 9. Comprehensive Reviews, Ratings & Moderation System
  app.get('/api/v1/reviews', (req, res) => {
    const {
      businessId,
      dealId,
      productId,
      serviceId,
      customerId,
      status,
      minRating,
      onlyVerified,
      itemType,
      sortBy,
      search,
    } = req.query;

    let result = [...reviews];

    if (businessId) {
      result = result.filter((r) => r.businessId === businessId);
    }
    if (dealId) {
      result = result.filter((r) => r.dealId === dealId);
    }
    if (productId) {
      result = result.filter((r) => r.productId === productId);
    }
    if (serviceId) {
      result = result.filter((r) => r.serviceId === serviceId);
    }
    if (customerId) {
      result = result.filter((r) => r.customerId === customerId);
    }
    if (itemType) {
      result = result.filter((r) => r.itemType === itemType);
    }
    if (status) {
      result = result.filter((r) => r.status === status);
    }
    if (minRating) {
      result = result.filter((r) => r.rating >= Number(minRating));
    }
    if (onlyVerified === 'true') {
      result = result.filter((r) => r.isVerifiedPurchase);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(
        (r) =>
          r.comment.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.dealTitle && r.dealTitle.toLowerCase().includes(q)) ||
          (r.businessName && r.businessName.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'rating_desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rating_asc') {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'helpful') {
      result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    } else {
      // default newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ success: true, data: result, total: result.length });
  });

  // Review Breakdown Statistics
  app.get('/api/v1/reviews/stats', (req, res) => {
    const { businessId, dealId, productId, serviceId } = req.query;
    let targetReviews = reviews.filter((r) => r.status === 'published' || !r.status);

    if (businessId) targetReviews = targetReviews.filter((r) => r.businessId === businessId);
    if (dealId) targetReviews = targetReviews.filter((r) => r.dealId === dealId);
    if (productId) targetReviews = targetReviews.filter((r) => r.productId === productId);
    if (serviceId) targetReviews = targetReviews.filter((r) => r.serviceId === serviceId);

    const counts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalStars = 0;
    let verifiedCount = 0;
    let recommendedCount = 0;

    targetReviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded] = (counts[rounded] || 0) + 1;
      totalStars += r.rating;
      if (r.isVerifiedPurchase) verifiedCount += 1;
      if (r.rating >= 4) recommendedCount += 1;
    });

    const total = targetReviews.length;
    const average = total > 0 ? Number((totalStars / total).toFixed(1)) : 5.0;
    const recommendationPercentage = total > 0 ? Math.round((recommendedCount / total) * 100) : 100;

    res.json({
      success: true,
      data: {
        5: counts[5],
        4: counts[4],
        3: counts[3],
        2: counts[2],
        1: counts[1],
        total,
        average,
        verifiedCount,
        recommendationPercentage,
      },
    });
  });

  app.post('/api/v1/reviews', (req, res) => {
    const {
      businessId,
      customerId,
      customerName,
      customerAvatar,
      rating,
      title,
      comment,
      orderId,
      itemType,
      dealId,
      productId,
      serviceId,
    } = req.body;

    // Find business details
    const biz = businesses.find((b) => b.id === businessId);
    const bizName = biz ? biz.name : 'DealHub Merchant';

    // Item title lookups
    let dealTitle: string | undefined;
    let productTitle: string | undefined;
    let serviceTitle: string | undefined;

    if (dealId) {
      const foundDeal = deals.find((d) => d.id === dealId);
      if (foundDeal) dealTitle = foundDeal.title;
    }
    if (productId) {
      const foundProd = productsAndServices.find((p) => p.id === productId);
      if (foundProd) productTitle = foundProd.title;
    }
    if (serviceId) {
      const foundSrv = productsAndServices.find((s) => s.id === serviceId);
      if (foundSrv) serviceTitle = foundSrv.title;
    }

    // Verify purchase link with completed customer orders
    const hasMatchingOrder = orders.some((o) => {
      const matchesCustomer = o.customerId === customerId || o.customerEmail?.toLowerCase() === customerName?.toLowerCase();
      const matchesBusiness = o.businessId === businessId;
      const matchesItem =
        (dealId && o.items.some((i) => i.dealId === dealId)) ||
        (productId && o.items.some((i) => i.productId === productId)) ||
        (serviceId && o.items.some((i) => i.serviceId === serviceId));
      return (matchesCustomer && matchesBusiness && (matchesItem || o.status === 'completed')) || o.isRedeemed;
    });

    const isVerifiedPurchase = req.body.isVerifiedPurchase !== undefined ? !!req.body.isVerifiedPurchase : hasMatchingOrder;

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      orderId: orderId || (hasMatchingOrder ? orders.find((o) => o.businessId === businessId && o.customerId === customerId)?.id : undefined),
      businessId,
      businessName: bizName,
      customerId: customerId || 'usr_cust_1',
      customerName: customerName || 'Verified Shopper',
      customerAvatar: customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: Math.min(5, Math.max(1, rating || 5)),
      title: title ? title.trim() : undefined,
      comment: comment || 'Verified feedback submitted on DealHub.',
      isVerifiedPurchase,
      itemType: itemType || (dealId ? 'deal' : productId ? 'product' : serviceId ? 'service' : 'business'),
      dealId,
      dealTitle,
      productId,
      productTitle,
      serviceId,
      serviceTitle,
      status: 'published',
      helpfulCount: 0,
      helpfulUserIds: [],
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newRev);

    // Recalculate and update business rating & reviewCount
    if (biz) {
      const publishedBizRevs = reviews.filter((r) => r.businessId === businessId && r.status === 'published');
      if (publishedBizRevs.length > 0) {
        const totalStars = publishedBizRevs.reduce((acc, r) => acc + r.rating, 0);
        biz.rating = Number((totalStars / publishedBizRevs.length).toFixed(1));
        biz.reviewCount = publishedBizRevs.length;
      }
    }

    // Recalculate and update product/service rating
    if (productId || serviceId) {
      const targetId = productId || serviceId;
      const targetItem = productsAndServices.find((p) => p.id === targetId);
      if (targetItem) {
        const itemRevs = reviews.filter((r) => (r.productId === targetId || r.serviceId === targetId) && r.status === 'published');
        if (itemRevs.length > 0) {
          const totalStars = itemRevs.reduce((acc, r) => acc + r.rating, 0);
          targetItem.rating = Number((totalStars / itemRevs.length).toFixed(1));
          targetItem.reviewCount = itemRevs.length;
        }
      }
    }

    logAudit(
      newRev.customerId,
      'customer',
      'SUBMIT_REVIEW',
      `Submitted ${newRev.rating}-star review for ${bizName} (${isVerifiedPurchase ? 'Verified Purchase' : 'Standard'}).`
    );

    res.json({
      success: true,
      data: newRev,
      message: 'Review and star rating posted successfully!',
    });
  });

  // Business Response to Customer Review
  app.put('/api/v1/reviews/:id/reply', (req, res) => {
    const { id } = req.params;
    const { sellerReply, sellerRepliedBy, actorId } = req.body;
    const rev = reviews.find((r) => r.id === id);

    if (!rev) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    rev.sellerReply = sellerReply;
    rev.sellerReplyDate = new Date().toISOString();
    rev.sellerRepliedBy = sellerRepliedBy || 'Store Manager';
    rev.updatedAt = new Date().toISOString();

    logAudit(
      actorId || 'seller',
      'seller',
      'REPLY_REVIEW',
      `Business replied to review #${id} by ${rev.customerName}`
    );

    res.json({ success: true, data: rev, message: 'Reply posted to customer review.' });
  });

  // Helpful Upvote on Review
  app.put('/api/v1/reviews/:id/helpful', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const rev = reviews.find((r) => r.id === id);

    if (!rev) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    rev.helpfulUserIds = rev.helpfulUserIds || [];
    const uid = userId || 'usr_cust_1';

    if (rev.helpfulUserIds.includes(uid)) {
      rev.helpfulUserIds = rev.helpfulUserIds.filter((u) => u !== uid);
      rev.helpfulCount = Math.max(0, (rev.helpfulCount || 1) - 1);
    } else {
      rev.helpfulUserIds.push(uid);
      rev.helpfulCount = (rev.helpfulCount || 0) + 1;
    }

    res.json({ success: true, data: rev, helpfulCount: rev.helpfulCount, isHelpfulByUser: rev.helpfulUserIds.includes(uid) });
  });

  // Report Review for Inappropriate Content
  app.post('/api/v1/reviews/:id/report', (req, res) => {
    const { id } = req.params;
    const { reportedByUserId, reason } = req.body;
    const rev = reviews.find((r) => r.id === id);

    if (!rev) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    rev.reportedBy = rev.reportedBy || [];
    if (reportedByUserId && !rev.reportedBy.includes(reportedByUserId)) {
      rev.reportedBy.push(reportedByUserId);
    }
    rev.status = 'flagged';
    rev.moderationReason = reason || 'Reported by community user for review moderation';

    logAudit(
      reportedByUserId || 'user',
      'user',
      'REPORT_REVIEW',
      `Review #${id} flagged for moderation. Reason: ${reason}`
    );

    res.json({ success: true, message: 'Review reported for administrative moderation review.' });
  });

  // Admin Review Moderation (Approve, Flag, Hide, Reject, Feature)
  app.put('/api/v1/admin/reviews/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, moderationReason, isFeatured, adminId } = req.body;
    const rev = reviews.find((r) => r.id === id);

    if (!rev) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    if (status) rev.status = status;
    if (moderationReason !== undefined) rev.moderationReason = moderationReason;
    if (isFeatured !== undefined) rev.isFeatured = isFeatured;
    rev.updatedAt = new Date().toISOString();

    // Recalculate business rating after moderation changes
    const biz = businesses.find((b) => b.id === rev.businessId);
    if (biz) {
      const activeBizRevs = reviews.filter((r) => r.businessId === rev.businessId && r.status === 'published');
      if (activeBizRevs.length > 0) {
        const totalStars = activeBizRevs.reduce((acc, r) => acc + r.rating, 0);
        biz.rating = Number((totalStars / activeBizRevs.length).toFixed(1));
        biz.reviewCount = activeBizRevs.length;
      }
    }

    logAudit(
      adminId || 'admin',
      'admin',
      'MODERATE_REVIEW',
      `Review #${id} status changed to ${status || 'updated'} (Featured: ${rev.isFeatured})`
    );

    res.json({ success: true, data: rev, message: 'Review moderation status updated successfully.' });
  });

  // Admin Delete Review
  app.delete('/api/v1/admin/reviews/:id', (req, res) => {
    const { id } = req.params;
    const { adminId, reason } = req.body;
    const revIndex = reviews.findIndex((r) => r.id === id);

    if (revIndex === -1) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    const removed = reviews.splice(revIndex, 1)[0];

    // Recalculate business rating
    const biz = businesses.find((b) => b.id === removed.businessId);
    if (biz) {
      const activeBizRevs = reviews.filter((r) => r.businessId === removed.businessId && r.status === 'published');
      if (activeBizRevs.length > 0) {
        const totalStars = activeBizRevs.reduce((acc, r) => acc + r.rating, 0);
        biz.rating = Number((totalStars / activeBizRevs.length).toFixed(1));
        biz.reviewCount = activeBizRevs.length;
      } else {
        biz.rating = 5.0;
        biz.reviewCount = 0;
      }
    }

    logAudit(
      adminId || 'admin',
      'admin',
      'DELETE_REVIEW',
      `Permanently deleted review #${id} by ${removed.customerName}. Reason: ${reason || 'Admin removed'}`
    );

    res.json({ success: true, message: 'Review deleted successfully.' });
  });

  // 10. Analytics & Admin Metrics
  app.get('/api/v1/analytics/platform', (req, res) => {
    const totalGMV = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalCommissionRevenue = orders.reduce((sum, o) => sum + o.platformCommissionAmount, 0);
    const totalOrdersCount = orders.length;
    const totalBusinessesCount = businesses.length;
    const verifiedBusinessesCount = businesses.filter((b) => b.isVerified).length;
    const activeDealsCount = deals.filter((d) => new Date(d.endDate) > new Date()).length;
    const totalSponsorBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

    res.json({
      success: true,
      data: {
        totalGMV,
        totalCommissionRevenue,
        commissionRatePercent: (systemConfig.defaultCommissionRate * 100).toFixed(1) + '%',
        totalOrdersCount,
        totalBusinessesCount,
        verifiedBusinessesCount,
        activeDealsCount,
        totalSponsorBudget,
        recentLogs: auditLogs.slice(0, 20),
      },
    });
  });

  // 11. Verified Direct Dealer Communication Endpoints (Server-Authorized)
  app.get('/api/v1/chat/conversations', (req, res) => {
    const userId = (req.query.userId as string) || '';
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized: User identity required.' });
      return;
    }

    // Filter conversations where user is customer OR dealer owner
    const userConvs = conversations.filter(
      (c) => c.customerId === userId || c.dealerOwnerId === userId
    );

    res.json({ success: true, data: userConvs });
  });

  app.post('/api/v1/chat/start', (req, res) => {
    const { customerId, customerName, customerAvatar, businessId, referencedDealId } = req.body;

    if (!customerId || !businessId) {
      res.status(400).json({ success: false, message: 'Missing customerId or businessId.' });
      return;
    }

    const biz = businesses.find((b) => b.id === businessId);
    if (!biz) {
      res.status(404).json({ success: false, message: 'Business not found.' });
      return;
    }

    // Check if conversation already exists between this customer and business
    let conv = conversations.find(
      (c) => c.customerId === customerId && c.businessId === businessId
    );

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        customerId,
        customerName: customerName || 'Valued Customer',
        customerAvatar: customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        businessId,
        businessName: biz.name,
        businessLogo: biz.logo,
        dealerOwnerId: biz.ownerId,
        lastMessageText: 'Started conversation with dealer.',
        lastMessageTimestamp: new Date().toISOString(),
        unreadCountCustomer: 0,
        unreadCountDealer: 0,
        createdAt: new Date().toISOString(),
      };
      conversations.unshift(conv);

      logAudit(customerId, 'customer', 'CHAT_START', `Initiated direct deal conversation with ${biz.name}`);
    }

    res.json({ success: true, data: conv });
  });

  app.get('/api/v1/chat/messages/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    const userId = (req.query.userId as string) || '';
    const isAdminModeration = req.query.adminModerationJustification as string;

    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    // SERVER-SIDE AUTHORIZATION CHECK
    const isAuthorizedParticipant = conv.customerId === userId || conv.dealerOwnerId === userId;

    if (!isAuthorizedParticipant && !isAdminModeration) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this private chat.',
      });
      return;
    }

    if (!isAuthorizedParticipant && isAdminModeration) {
      // Log sensitive admin moderation access
      logAudit(
        userId || 'admin',
        'moderation_admin',
        'SENSITIVE_CHAT_ACCESS',
        `Admin accessed private conversation ${conversationId}. Justification: "${isAdminModeration}"`
      );
    }

    const messages = chatMessages.filter((m) => m.conversationId === conversationId);
    res.json({ success: true, data: messages, conversation: conv });
  });

  app.post('/api/v1/chat/messages', (req, res) => {
    const {
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      text,
      attachmentUrl,
      referencedDealId,
      referencedProductId,
      referencedOrderId,
    } = req.body;

    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    // SERVER-SIDE AUTHORIZATION CHECK
    if (conv.customerId !== senderId && conv.dealerOwnerId !== senderId) {
      res.status(403).json({ success: false, message: 'Forbidden: You cannot send messages in this chat.' });
      return;
    }

    if (conv.isBlocked) {
      res.status(400).json({ success: false, message: 'This conversation has been blocked.' });
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId,
      senderName: senderName || 'User',
      senderAvatar,
      text: text || '',
      attachmentUrl,
      referencedDealId,
      referencedProductId,
      referencedOrderId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    chatMessages.push(newMsg);

    // Update conversation summary
    conv.lastMessageText = text || (attachmentUrl ? '📷 Attachment' : 'Sent a reference');
    conv.lastMessageTimestamp = newMsg.createdAt;

    if (senderId === conv.customerId) {
      conv.unreadCountDealer += 1;
    } else {
      conv.unreadCountCustomer += 1;
    }

    res.json({ success: true, data: newMsg });
  });

  app.post('/api/v1/chat/report', (req, res) => {
    const { conversationId, reportedByUserId, reason } = req.body;
    const modReq: ChatModerationRequest = {
      id: `mod_${Date.now()}`,
      conversationId,
      reportedByUserId,
      reason: reason || 'Inappropriate messaging or policy violation',
      status: 'pending_review',
      timestamp: new Date().toISOString(),
    };
    chatModerationRequests.unshift(modReq);

    logAudit(
      reportedByUserId,
      'user',
      'CHAT_REPORTED',
      `Reported conversation ${conversationId} for moderation. Reason: ${reason}`
    );

    res.json({ success: true, message: 'Conversation reported for admin moderation review.' });
  });

  app.post('/api/v1/chat/block', (req, res) => {
    const { conversationId, userId } = req.body;
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.isBlocked = !conv.isBlocked;
      conv.blockedBy = conv.isBlocked ? userId : undefined;
    }
    res.json({ success: true, isBlocked: conv?.isBlocked });
  });

  // 12. Admin Security & Controlled Moderation
  app.get('/api/v1/admin/audit-logs', (req, res) => {
    res.json({ success: true, data: auditLogs });
  });

  app.post('/api/v1/admin/audit-log', (req, res) => {
    const { actorId, actorRole, action, details } = req.body;
    logAudit(actorId || 'admin', actorRole || 'super_admin', action || 'ADMIN_ACTION', details || '');
    res.json({ success: true, message: 'Audit entry logged.' });
  });

  app.get('/api/v1/admin/chat/moderation-requests', (req, res) => {
    res.json({ success: true, data: chatModerationRequests });
  });

  app.post('/api/v1/admin/chat/approve-access', (req, res) => {
    const { requestId, adminId, justification } = req.body;
    const reqItem = chatModerationRequests.find((r) => r.id === requestId);
    if (reqItem) {
      reqItem.status = 'approved_access';
      reqItem.reviewedByAdminId = adminId;
      reqItem.accessJustification = justification;

      logAudit(
        adminId,
        'moderation_admin',
        'MODERATION_ACCESS_GRANTED',
        `Approved moderation access for conversation ${reqItem.conversationId}. Reason: ${justification}`
      );
    }
    res.json({ success: true, data: reqItem });
  });

  // 13. Zero-Budget AI Customer Support Endpoint (Gemini / Local / No-AI Abstraction)
  app.post('/api/v1/ai/support', async (req, res) => {
    try {
      const { prompt, userContext, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      const provider = process.env.AI_PROVIDER || (apiKey ? 'free' : 'none');

      // Knowledge context from published articles
      const kbContext = knowledgeBaseArticles
        .filter((a) => a.isPublished)
        .map((a) => `[${a.category.toUpperCase()}] ${a.title}:\n${a.content}`)
        .join('\n\n');

      const systemInstruction = `You are DealHub AI Assistant, an empathetic, clear, professional support assistant for the universal marketplace platform DealHub.
Your role:
- Answer user queries accurately regarding navigation, products, services, deals, vouchers, bookings, orders, and business verification using the Knowledge Base below.
- Knowledge Base:
${kbContext}

CRITICAL GUARDRAILS & SAFETY RULES:
- You DO NOT have permission to issue refunds, alter payouts, change commission rates, modify account passwords, or grant user roles.
- If a user requests a refund, financial dispute resolution, or account role escalation, clearly explain that you are an AI support assistant and offer to open an official Human Support Ticket for escalation to staff/managers.
- Keep responses concise, well-formatted, and helpful.`;

      if (provider === 'free' && apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const fullPrompt = `${systemInstruction}\n\nUser Question: ${prompt}`;
        const aiResponse = await ai.models.generateContent({
          model: process.env.AI_MODEL || 'gemini-3.6-flash',
          contents: fullPrompt,
        });

        const textResponse = aiResponse.text || "I'm here to help with DealHub marketplace questions!";
        
        // Detect high-risk or financial refund intent for escalation offer
        const lowerPrompt = (prompt || '').toLowerCase();
        const isHighRisk = lowerPrompt.includes('refund') || lowerPrompt.includes('chargeback') || lowerPrompt.includes('payout') || lowerPrompt.includes('fraud') || lowerPrompt.includes('dispute');

        res.json({
          success: true,
          provider: 'free_gemini',
          reply: textResponse,
          shouldEscalate: isHighRisk,
        });
        return;
      }

      // Local / No-AI Fallback: Search knowledge base matching
      const query = (prompt || '').toLowerCase();
      const matchedArticles = knowledgeBaseArticles.filter(
        (a) =>
          a.isPublished &&
          (a.title.toLowerCase().includes(query) ||
            a.content.toLowerCase().includes(query) ||
            a.tags.some((t) => query.includes(t.toLowerCase())))
      );

      let fallbackReply = '';
      if (matchedArticles.length > 0) {
        fallbackReply = `Here is what I found in the DealHub Knowledge Base regarding your inquiry:\n\n` +
          matchedArticles.slice(0, 2).map((a) => `📌 **${a.title}**:\n${a.content}`).join('\n\n') +
          `\n\nNeed further personal assistance? You can convert this into an official Human Support Ticket.`;
      } else {
        fallbackReply = `Welcome to DealHub Customer Support! I am currently running in Zero-Budget mode.\n\n` +
          `I can help answer questions about deal vouchers, 2% commission settlements, business verification, and service bookings.\n\n` +
          `If you have a complex order query or refund request, click below to open a direct Human Support Ticket with our team!`;
      }

      const isHighRiskFallback = query.includes('refund') || query.includes('payout') || query.includes('cancel') || query.includes('fraud') || query.includes('dispute');

      res.json({
        success: true,
        provider: 'knowledge_base_fallback',
        reply: fallbackReply,
        shouldEscalate: isHighRiskFallback || matchedArticles.length === 0,
      });
    } catch (err: any) {
      console.error('AI Support Error:', err);
      res.json({
        success: true,
        provider: 'error_fallback',
        reply: 'DealHub Customer Support is ready to assist you. You can also create an official Human Support Ticket at any time.',
        shouldEscalate: true,
      });
    }
  });

  // 14. Support Ticket API
  app.get('/api/v1/support/tickets', (req, res) => {
    const { userId, status, assignedStaffId } = req.query;
    let result = [...supportTickets];

    if (userId) {
      result = result.filter((t) => t.userId === userId);
    }
    if (status) {
      result = result.filter((t) => t.status === status);
    }
    if (assignedStaffId) {
      result = result.filter((t) => t.assignedStaffId === assignedStaffId);
    }

    res.json({ success: true, data: result });
  });

  app.post('/api/v1/support/tickets', (req, res) => {
    const { userId, userName, userEmail, category, subject, description, priority, attachments } = req.body;

    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: userId || 'usr_cust_1',
      userName: userName || 'Valued User',
      userEmail: userEmail || 'user@example.com',
      category: category || 'other',
      subject: subject || 'Support Request',
      description: description || '',
      attachments: attachments || [],
      priority: priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiHandled: false,
      messages: [
        {
          id: `msg_t_${Date.now()}`,
          ticketId: `tkt_${Date.now()}`,
          senderId: userId || 'usr_cust_1',
          senderName: userName || 'Valued User',
          senderRole: 'user',
          message: description || subject || 'Need help with platform issue.',
          attachments,
          createdAt: new Date().toISOString(),
        },
      ],
      auditHistory: [
        `${new Date().toISOString()}: Ticket created by ${userName || 'user'} (${category})`,
      ],
    };

    supportTickets.unshift(newTicket);
    logAudit(newTicket.userId, 'user', 'CREATE_SUPPORT_TICKET', `Created support ticket #${newTicket.ticketNumber} [${newTicket.category}]`);

    res.json({ success: true, data: newTicket, message: 'Support ticket created successfully.' });
  });

  app.get('/api/v1/support/tickets/:id', (req, res) => {
    const ticket = supportTickets.find((t) => t.id === req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }
    res.json({ success: true, data: ticket });
  });

  app.post('/api/v1/support/tickets/:id/messages', (req, res) => {
    const { senderId, senderName, senderRole, message, attachments } = req.body;
    const ticket = supportTickets.find((t) => t.id === req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    const newMsg: SupportMessage = {
      id: `msg_t_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      ticketId: ticket.id,
      senderId,
      senderName,
      senderRole: senderRole || 'user',
      message,
      attachments,
      createdAt: new Date().toISOString(),
    };

    ticket.messages.push(newMsg);
    ticket.updatedAt = new Date().toISOString();

    if (senderRole === 'staff' || senderRole === 'manager' || senderRole === 'owner') {
      ticket.status = 'in_progress';
    }

    res.json({ success: true, data: newMsg, ticket });
  });

  app.put('/api/v1/support/tickets/:id/status', (req, res) => {
    const { status, assignedStaffId, assignedStaffName, assignedManagerId, resolution, actorId, actorRole } = req.body;
    const ticket = supportTickets.find((t) => t.id === req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (status) ticket.status = status;
    if (assignedStaffId) {
      ticket.assignedStaffId = assignedStaffId;
      ticket.assignedStaffName = assignedStaffName || 'Assigned Staff';
    }
    if (assignedManagerId) {
      ticket.assignedManagerId = assignedManagerId;
    }
    if (resolution) ticket.resolution = resolution;
    ticket.updatedAt = new Date().toISOString();

    const auditEntry = `${new Date().toISOString()}: Updated by ${actorRole || 'staff'} -> Status: ${ticket.status}`;
    ticket.auditHistory.push(auditEntry);

    logAudit(actorId || 'staff', actorRole || 'staff', 'UPDATE_TICKET', `Ticket #${ticket.ticketNumber} updated to ${ticket.status}`);

    res.json({ success: true, data: ticket });
  });

  // 15. Knowledge Base API
  app.get('/api/v1/knowledge-base', (req, res) => {
    res.json({ success: true, data: knowledgeBaseArticles });
  });

  app.post('/api/v1/knowledge-base', (req, res) => {
    const { title, category, content, tags } = req.body;
    const newKb: KnowledgeBaseArticle = {
      id: `kb_${Date.now()}`,
      title,
      category: category || 'other',
      content,
      tags: tags || [],
      isPublished: true,
      lastUpdated: new Date().toISOString(),
      viewsCount: 0,
    };
    knowledgeBaseArticles.unshift(newKb);
    logAudit('usr_admin_1', 'owner', 'CREATE_KB_ARTICLE', `Published Knowledge Base article: ${title}`);
    res.json({ success: true, data: newKb });
  });

  app.put('/api/v1/knowledge-base/:id', (req, res) => {
    const index = knowledgeBaseArticles.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Knowledge base article not found' });
      return;
    }
    knowledgeBaseArticles[index] = { ...knowledgeBaseArticles[index], ...req.body, lastUpdated: new Date().toISOString() };
    res.json({ success: true, data: knowledgeBaseArticles[index] });
  });

  app.delete('/api/v1/knowledge-base/:id', (req, res) => {
    knowledgeBaseArticles = knowledgeBaseArticles.filter((a) => a.id !== req.params.id);
    res.json({ success: true, message: 'Knowledge base article deleted' });
  });

  // 16. Manager Invitations & Owner Role Control
  app.get('/api/v1/managers/invitations', (req, res) => {
    res.json({ success: true, data: managerInvitations });
  });

  app.post('/api/v1/managers/invitation', (req, res) => {
    const { email, role, scope, department, invitedBy, invitedByName } = req.body;

    const newInvite: ManagerInvitation = {
      id: `inv_${Date.now()}`,
      email,
      role: role || 'manager',
      scope: scope || ['all'],
      department: department || 'General Operations',
      invitationToken: `INV-DEALHUB-${Math.floor(100000 + Math.random() * 900000)}`,
      invitedBy: invitedBy || 'usr_owner_1',
      invitedByName: invitedByName || 'DealHub Platform Owner',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days expiry
    };

    managerInvitations.unshift(newInvite);
    logAudit(
      invitedBy || 'usr_owner_1',
      'owner',
      'INVITE_MANAGER',
      `Sent invitation for role '${role}' to email ${email}. Token: ${newInvite.invitationToken}`
    );

    res.json({
      success: true,
      data: newInvite,
      message: 'Invitation generated successfully! Share token/link with candidate.',
    });
  });

  app.post('/api/v1/managers/accept-invitation', (req, res) => {
    const { invitationToken, name, password, phone } = req.body;
    const invite = managerInvitations.find((i) => i.invitationToken === invitationToken && i.status === 'pending');

    if (!invite) {
      res.status(400).json({ success: false, message: 'Invalid or expired manager invitation token.' });
      return;
    }

    if (new Date(invite.expiresAt) < new Date()) {
      invite.status = 'expired';
      res.status(400).json({ success: false, message: 'This manager invitation link has expired.' });
      return;
    }

    // Create new staff/manager user
    const newUser: User = {
      id: `usr_${invite.role}_${Date.now()}`,
      name: name || invite.email.split('@')[0],
      email: invite.email,
      phone: phone || '+92 300 0000000',
      role: invite.role,
      department: invite.department,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    invite.status = 'accepted';
    invite.acceptedAt = new Date().toISOString();
    invite.lastLoginAt = new Date().toISOString();

    logAudit(
      newUser.id,
      newUser.role,
      'ACCEPT_MANAGER_INVITE',
      `User ${newUser.name} accepted manager invitation token and initialized private credentials.`
    );

    res.json({
      success: true,
      data: newUser,
      message: `Account activated successfully as ${invite.role.toUpperCase()}!`,
    });
  });

  app.put('/api/v1/managers/invitation/:id/status', (req, res) => {
    const { status, actorId } = req.body;
    const invite = managerInvitations.find((i) => i.id === req.params.id);
    if (!invite) {
      res.status(404).json({ success: false, message: 'Invitation not found' });
      return;
    }

    invite.status = status;
    logAudit(actorId || 'usr_owner_1', 'owner', 'REVOKE_INVITATION', `Revoked invitation for ${invite.email}`);
    res.json({ success: true, data: invite });
  });

  // 17. App Update Center ("What's New")
  app.get('/api/v1/app-updates', (req, res) => {
    res.json({ success: true, data: appUpdates });
  });

  app.post('/api/v1/app-updates', (req, res) => {
    const { version, title, description, category, importance, platform, changelog, isCriticalUpdate, publishedBy } = req.body;

    const newUpdate: AppUpdate = {
      id: `upd_${version.replace(/\./g, '_')}_${Date.now()}`,
      version,
      title,
      description,
      category: category || 'feature',
      releaseDate: new Date().toISOString().split('T')[0],
      importance: importance || 'normal',
      platform: platform || 'all',
      changelog: changelog || [],
      status: 'published',
      isCriticalUpdate: !!isCriticalUpdate,
      publishedBy: publishedBy || 'DealHub Owner',
    };

    appUpdates.unshift(newUpdate);
    logAudit('usr_owner_1', 'owner', 'PUBLISH_APP_UPDATE', `Published App Update v${version}: ${title}`);

    res.json({ success: true, data: newUpdate, message: 'App update published successfully.' });
  });

  // Vite development server middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DealHub Universal Marketplace Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
