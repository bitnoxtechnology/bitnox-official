import { ClientSession } from "mongoose";
import { mongoInstance } from "./db";

type TransactionCallback<T> = (session: ClientSession) => Promise<T>;

export const runWithTransaction = async <T>(
  callback: TransactionCallback<T>
): Promise<T> => {
  const session = await mongoInstance.startSession();

  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
