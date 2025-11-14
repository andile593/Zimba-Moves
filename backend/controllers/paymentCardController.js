const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const ApiError = require('../utils/ApiError');

// Bank codes mapping (South African banks)
const BANK_NAMES = {
  '632005': 'First National Bank',
  '051001': 'Standard Bank',
  '470010': 'Capitec Bank',
  '198765': 'Nedbank',
  '580105': 'Investec Bank',
  '430000': 'African Bank',
};

/**
 * Add a new payment card/bank account
 */
exports.addPaymentCard = async (req, res, next) => {
  try {
    const { id: providerId } = req.params;
    const { accountNumber, accountName, bankCode } = req.body;

    // Verify provider ownership
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new ApiError(404, 'Provider not found');
    }

    if (req.user.role !== 'ADMIN' && provider.userId !== req.user.userId) {
      throw new ApiError(403, 'You can only add cards to your own profile');
    }

    // Validate required fields
    if (!accountNumber || !accountName || !bankCode) {
      throw new ApiError(400, 'Account number, name, and bank code are required');
    }

    const bankName = BANK_NAMES[bankCode] || 'Unknown Bank';

    // Check if this is the first card (make it default)
    const existingCards = await prisma.paymentCard.findMany({
      where: { providerId }
    });

    const isFirstCard = existingCards.length === 0;

    // Create transfer recipient in Paystack
    let recipientCode = null;
    try {
      const paystackResponse = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: 'nuban', // Nigerian Uniform Bank Account Number (also works for SA)
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'ZAR'
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            'Content-Type': 'application/json'
          }
        }
      );

      recipientCode = paystackResponse.data.data.recipient_code;
    } catch (error) {
      console.error('Paystack recipient creation error:', error.response?.data);
      throw new ApiError(
        400, 
        error.response?.data?.message || 'Failed to verify bank account with payment provider'
      );
    }

    // Create payment card record
    const paymentCard = await prisma.paymentCard.create({
      data: {
        providerId,
        accountNumber,
        accountName,
        bankCode,
        bankName,
        recipientCode,
        isDefault: isFirstCard,
        isVerified: true
      }
    });

    res.status(201).json({
      message: 'Bank account added successfully',
      paymentCard
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all payment cards for a provider
 */
exports.getPaymentCards = async (req, res, next) => {
  try {
    const { id: providerId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new ApiError(404, 'Provider not found');
    }

    if (req.user.role !== 'ADMIN' && provider.userId !== req.user.userId) {
      throw new ApiError(403, 'Forbidden');
    }

    const cards = await prisma.paymentCard.findMany({
      where: { providerId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(cards);
  } catch (err) {
    next(err);
  }
};

/**
 * Set a card as default
 */
exports.setDefaultCard = async (req, res, next) => {
  try {
    const { id: providerId, cardId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new ApiError(404, 'Provider not found');
    }

    if (req.user.role !== 'ADMIN' && provider.userId !== req.user.userId) {
      throw new ApiError(403, 'Forbidden');
    }

    const card = await prisma.paymentCard.findUnique({
      where: { id: cardId }
    });

    if (!card || card.providerId !== providerId) {
      throw new ApiError(404, 'Card not found');
    }

    // Remove default from all other cards
    await prisma.paymentCard.updateMany({
      where: { 
        providerId,
        id: { not: cardId }
      },
      data: { isDefault: false }
    });

    // Set this card as default
    const updatedCard = await prisma.paymentCard.update({
      where: { id: cardId },
      data: { isDefault: true }
    });

    res.json({
      message: 'Default account updated',
      paymentCard: updatedCard
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a payment card
 */
exports.deletePaymentCard = async (req, res, next) => {
  try {
    const { id: providerId, cardId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new ApiError(404, 'Provider not found');
    }

    if (req.user.role !== 'ADMIN' && provider.userId !== req.user.userId) {
      throw new ApiError(403, 'Forbidden');
    }

    const card = await prisma.paymentCard.findUnique({
      where: { id: cardId }
    });

    if (!card || card.providerId !== providerId) {
      throw new ApiError(404, 'Card not found');
    }

    // Don't allow deleting the default card if there are other cards
    if (card.isDefault) {
      const otherCards = await prisma.paymentCard.findMany({
        where: { 
          providerId,
          id: { not: cardId }
        }
      });

      if (otherCards.length > 0) {
        throw new ApiError(400, 'Cannot delete default card. Please set another card as default first.');
      }
    }

    await prisma.paymentCard.delete({
      where: { id: cardId }
    });

    res.json({ message: 'Bank account removed successfully' });
  } catch (err) {
    next(err);
  }
};
// In paymentCardController.js

// Pure business logic function
async function createProviderPayout(providerId, amount, reason = null) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      paymentCards: {
        where: { isDefault: true }
      }
    }
  });

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  if (!provider.paymentCards || provider.paymentCards.length === 0) {
    throw new ApiError(400, 'Provider has no default payment account');
  }

  const defaultCard = provider.paymentCards[0];

  if (!defaultCard.recipientCode) {
    throw new ApiError(400, 'Payment account not properly configured');
  }

  // Create Payout record FIRST
  const payout = await prisma.payout.create({
    data: {
      providerId,
      paymentCardId: defaultCard.id,
      amount,
      status: 'PENDING',
    }
  });

  try {
    // Initiate transfer via Paystack
    const transferResponse = await axios.post(
      'https://api.paystack.co/transfer',
      {
        source: 'balance',
        amount: amount * 100,
        recipient: defaultCard.recipientCode,
        reason: reason || `Payout ${payout.id} for provider ${provider.id}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update with Paystack reference
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        transferCode: transferResponse.data.data.transfer_code,
        reference: transferResponse.data.data.reference,
        status: 'PROCESSING',
      }
    });

    return { success: true, payout, transfer: transferResponse.data.data };
  } catch (error) {
    // Mark payout as failed
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: 'FAILED' }
    });
    throw error;
  }
}

// Express route handler
exports.initiateProviderPayout = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { amount, reason } = req.body;

    if (req.user.role !== 'ADMIN') {
      throw new ApiError(403, 'Only admins can initiate payouts');
    }

    const result = await createProviderPayout(providerId, amount, reason);

    res.json({
      message: 'Payout initiated successfully',
      payout: result.payout,
      transfer: result.transfer
    });
  } catch (err) {
    console.error('Payout error:', err.response?.data || err.message);
    next(err);
  }
};

/**
 * Get all payouts for a provider
 */
exports.getProviderPayouts = async (req, res, next) => {
  try {
    const { id: providerId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new ApiError(404, 'Provider not found');
    }

    if (req.user.role !== 'ADMIN' && provider.userId !== req.user.userId) {
      throw new ApiError(403, 'Forbidden');
    }

    const payouts = await prisma.payout.findMany({
      where: { providerId },
      include: {
        paymentCard: {
          select: {
            accountName: true,
            bankName: true,
            accountNumber: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payouts);
  } catch (err) {
    next(err);
  }
};

module.exports = { ...exports, createProviderPayout };
