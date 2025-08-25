# Database Seeding Guide

This guide explains how to seed your database with sample data for the Krishi Equipment Marketplace.

## Quick Start

### 1. Reset and Seed Database
```bash
npm run db:reset
```
This command will:
- Reset the database (delete all data)
- Run migrations
- Seed with sample data

### 2. Only Seed (without reset)
```bash
npm run db:seed
```
This will add sample data to your existing database.

### 3. View Data
```bash
npm run db:studio
```
Opens Prisma Studio to view and edit your data.

## Sample Data Included

### Users (4 total)
1. **Rajesh Kumar** - Farmer
   - Email: `rajesh.farmer@example.com`
   - Role: FARMER
   - WhatsApp: `+919876543210`

2. **Priya Sharma** - Consumer
   - Email: `priya.buyer@example.com`
   - Role: CONSUMER
   - WhatsApp: `+919876543211`

3. **Amit Singh** - Farmer
   - Email: `amit.equipment@example.com`
   - Role: FARMER
   - WhatsApp: `+919876543212`

4. **Kavita Patel** - Consumer
   - Email: `kavita.farming@example.com`
   - Role: CONSUMER
   - WhatsApp: `+919876543213`

**Password for all accounts:** `password123`

### Equipment Listings (8 total)
- **Tractors** (3): John Deere 5055E, Mahindra 575 DI XP Plus, Massey Ferguson 241 DI
- **Harvesters** (1): CLAAS Lexion 770 Combine Harvester
- **Tillers** (2): Tillage King Disc Harrow, Kuhn Krause 8005-23 Disc Harrow
- **Irrigation Systems** (2): Drip Irrigation System, Solar Powered Water Pump

### Inquiries (5 total)
- Various statuses: NEW, CONTACTED, IN_DISCUSSION, CLOSED, PURCHASED
- Realistic buyer messages and seller responses
- WhatsApp integration examples

### Legacy Marketplace Items (3 total)
- Organic seeds and manure for backward compatibility

## Equipment Categories

- **Tractor**: Agricultural tractors of various HP and brands
- **Harvester**: Combine harvesters for grain harvesting
- **Tiller**: Disc harrows and tilling equipment
- **Irrigation System**: Water pumps and irrigation equipment

## Equipment Conditions

- **NEW**: Brand new equipment
- **USED**: Pre-owned but in good condition
- **REFURBISHED**: Completely restored equipment

## Testing the Marketplace

After seeding, you can:

1. **Browse Equipment**: Visit `/equipment` to see all listings
2. **View Details**: Click on any equipment to see detailed information
3. **Send Inquiries**: Use the WhatsApp integration to contact sellers
4. **Seller Dashboard**: Login as a farmer to manage equipment and inquiries
5. **Role Testing**: Switch between farmer and consumer accounts to test features

## Sample User Flows

### As a Consumer (Priya Sharma):
1. Browse equipment at `/equipment`
2. Filter by category, condition, or location
3. Click on equipment to view details
4. Send inquiries via WhatsApp integration
5. View inquiry history at `/inquiries`

### As a Farmer (Rajesh Kumar):
1. Access seller dashboard at `/sell`
2. View equipment listings at `/sell/equipment`
3. Add new equipment at `/sell/equipment/new`
4. Manage inquiries at `/sell/inquiries`
5. Respond to buyer inquiries

## Troubleshooting

### If seeding fails:
1. Make sure your database is running
2. Check your `.env` file for correct database URL
3. Run `npx prisma generate` to update Prisma client
4. Check that all required environment variables are set

### If you can't login:
- Use the email/password combinations listed above
- Make sure NextAuth is properly configured
- Check browser console for authentication errors

### If WhatsApp links don't work:
- WhatsApp numbers in sample data are fictional
- In production, use real WhatsApp Business numbers
- Test with your own WhatsApp number for development

## Environment Variables

Make sure these are set in your `.env` file:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Production Notes

⚠️ **Important**: Never run `db:reset` in production! This will delete all data.

For production seeding:
1. Create a separate production seed script
2. Use `prisma db push` for schema updates
3. Manually create admin users instead of sample users
4. Use real WhatsApp numbers for business accounts
