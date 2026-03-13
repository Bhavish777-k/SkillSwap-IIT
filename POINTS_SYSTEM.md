# Points System Documentation

## Overview
The SkillSwap platform now includes a comprehensive points system that enables users to manage their learning currency. Users receive initial points upon registration and can purchase additional points to continue their learning journey.

## Features

### 1. **Initial Points**
- New users receive **100 points** automatically upon registration
- Points are added to the user account immediately after successful registration

### 2. **Points Usage**
- **Session Booking**: Users spend points to book learning sessions
- **Cost Calculation**: 10 points per hour of session
  - Example: A 60-minute session costs 10 points
  - Example: A 90-minute session costs 20 points (rounded up)
- Points are deducted when a session is created (not when completed)

### 3. **Points Purchase**
Users can purchase additional points through various packages:

| Points | Price | Bonus | Total Points | Popular |
|--------|-------|-------|--------------|---------|
| 50     | $4.99 | 0     | 50           | No      |
| 100    | $9.99 | 10    | 110          | No      |
| 250    | $19.99| 50    | 300          | **Yes** |
| 500    | $34.99| 100   | 600          | No      |
| 1000   | $59.99| 250   | 1250         | No      |

### 4. **Transaction History**
All point activities are tracked and displayed:
- **Earned**: Points received (initial signup, bonuses)
- **Spent**: Points used for sessions
- **Purchased**: Points bought through payment
- **Refund**: Points returned (cancelled sessions)
- **Bonus**: Additional points from promotions

### 5. **Point Balance Display**
- Real-time balance shown in the navbar
- Color-coded indicators:
  - **Green**: 50+ points (healthy balance)
  - **Yellow**: 20-49 points (low balance warning)
  - **Red**: <20 points (critical - purchase needed)

## API Endpoints

### Get Points Balance
```
GET /api/points
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "currentBalance": 100,
    "totalEarned": 100,
    "totalSpent": 0
  }
}
```

### Get Transaction History
```
GET /api/points/transactions?page=1&limit=20&type=spent
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [...transactions],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Purchase Points
```
POST /api/points/purchase
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": 110,
  "paymentId": "PAYMENT_ID_FROM_GATEWAY"
}

Response:
{
  "success": true,
  "message": "Successfully purchased 110 points",
  "data": {
    "newBalance": 210
  }
}
```

### Get Available Packages
```
GET /api/points/packages

Response:
{
  "success": true,
  "data": [
    {
      "points": 50,
      "price": 4.99,
      "bonus": 0,
      "popular": false
    },
    ...
  ]
}
```

## Database Models

### User Model Updates
```javascript
{
  points: {
    type: Number,
    default: 100,  // Initial points
    min: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  totalPointsSpent: {
    type: Number,
    default: 0
  }
}
```

### PointTransaction Model
```javascript
{
  user: ObjectId,
  type: String,  // 'earned', 'spent', 'purchased', 'refund', 'bonus'
  amount: Number,
  description: String,
  relatedSession: ObjectId (optional),
  paymentId: String (optional),
  balanceAfter: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Components

### 1. PointsDisplay Component
- Location: `client/src/components/PointsDisplay.jsx`
- Shows current points balance in the navbar
- Links to the Points page
- Color-coded based on balance level

### 2. PointsPage Component
- Location: `client/src/pages/PointsPage.jsx`
- Displays detailed balance information
- Shows transaction history
- Provides point purchase interface
- Two tabs: Transaction History and Purchase Points

### 3. Integration with Session Booking
- Automatically checks point balance before session creation
- Deducts appropriate points based on session duration
- Creates transaction record for audit trail
- Shows error if insufficient points

## Usage Flow

### For New Users:
1. Register account → Receive 100 points
2. Browse mentors and skills
3. Book sessions using points
4. When points run low, purchase more

### For Existing Users:
1. Check balance in navbar
2. View transaction history in Points page
3. Purchase points as needed
4. Continue booking sessions

## Error Handling

### Insufficient Points
```javascript
{
  "success": false,
  "message": "Insufficient points"
}
```

### Invalid Purchase Amount
```javascript
{
  "success": false,
  "message": "Invalid point amount"
}
```

## Future Enhancements

1. **Payment Gateway Integration**
   - Integrate Stripe for credit card payments
   - Add PayPal support
   - Support multiple currencies

2. **Earning Points**
   - Award points for completing sessions as a mentor
   - Bonus points for referrals
   - Daily login rewards
   - Achievement-based point rewards

3. **Premium Features**
   - Subscription plans with monthly point allowances
   - VIP packages with better point rates
   - Corporate/Institutional bulk purchases

4. **Point Management**
   - Point expiration system
   - Point gifting between users
   - Point leaderboards and gamification

5. **Analytics**
   - Spending patterns dashboard
   - Point usage forecasting
   - Budget recommendations

## Configuration

### Point Pricing (Default)
- Initial signup bonus: 100 points
- Session cost: 10 points per hour
- Minimum purchase: 50 points
- Maximum purchase: 1000 points (single transaction)

### Customization
To modify point costs, update:
- `server/controllers/sessionController.js` - Line calculating `pointsCost`
- `server/controllers/pointsController.js` - `getPointPackages` function
- `server/models/User.js` - Default points value

## Security Considerations

1. **Transaction Verification**
   - All point transactions are logged
   - Payment IDs are stored for audit
   - User balance is atomic (prevents race conditions)

2. **Authorization**
   - All point endpoints require authentication
   - Users can only access their own point data
   - Admin endpoints planned for point management

3. **Validation**
   - Point amounts are validated (min: 0)
   - Negative transactions prevented
   - Payment verification required for purchases

## Testing

### Manual Testing Checklist
- [ ] New user receives 100 points on registration
- [ ] Points display correctly in navbar
- [ ] Transaction history shows all activities
- [ ] Points deducted correctly on session booking
- [ ] Insufficient points prevents session creation
- [ ] Point purchase updates balance correctly
- [ ] Color indicators work properly (<20, 20-49, 50+)

### API Testing
```bash
# Get balance
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/points

# Get transactions
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/points/transactions

# Purchase points (mock)
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"amount": 110, "paymentId": "MOCK_123"}' \
  http://localhost:5000/api/points/purchase
```

## Support

For issues or questions about the points system:
1. Check transaction history for discrepancies
2. Verify payment confirmation emails
3. Contact support with transaction IDs for refunds
4. Review balance calculations in dashboard

---

**Last Updated**: February 5, 2026
**Version**: 1.0.0
