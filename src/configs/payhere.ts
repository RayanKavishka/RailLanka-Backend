const payhereConfig = {
    merchantId: process.env.PAYHERE_MERCHANT_ID!,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET!,
    checkoutUrl: process.env.PAYHERE_SANDBOX_URL!
};


export default payhereConfig;