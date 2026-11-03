import { createHash, timingSafeEqual } from "node:crypto";
import payhereConfig from "../configs/payhere";


const generateMD5 = (value: string): string => {
    return createHash("md5")
        .update(value)
        .digest("hex")
        .toUpperCase();
};

export const generatePayHereHash = ({
    paymentId,
    amount,
    currency
}: {
    paymentId: string;
    amount: number;
    currency: string;
}): string => {

    const formattedAmount = amount.toFixed(2);

    const hashedSecret = generateMD5(
        payhereConfig.merchantSecret
    );

    return generateMD5(
        payhereConfig.merchantId +
        paymentId +
        formattedAmount +
        currency +
        hashedSecret
    );
};

export const verifyPayHereNotification = ({
  merchantId,
  orderId,
  amount,
  currency,
  statusCode,
  receivedHash
}: {
    merchantId: string;
    orderId: string;
    amount: string;
    currency: string;
    statusCode: string;
    receivedHash: string;
}): boolean => {

    const hashedSecret = generateMD5(
        payhereConfig.merchantSecret
    );

    const localHash = generateMD5(
        merchantId +
        orderId +
        amount +
        currency +
        statusCode +
        hashedSecret
    );

    const received = receivedHash.toUpperCase();

    if (!/^[A-F0-9]{32}$/.test(received)) {
        return false;
    }

    return timingSafeEqual(
        Buffer.from(localHash, "hex"),
        Buffer.from(received, "hex")
    );
};
