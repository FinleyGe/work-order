import { verifyAccessToken } from '@/services/backend/auth';
import { jsonRes } from '@/services/backend/response';
import { getAllOrdersByUserId } from '@/services/db/workorder';
import { WorkOrderStatus } from '@/types/workorder';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderStatus,
      orderType,
      startTime,
      endTime,
      level
    } = req.body as {
      page: number;
      pageSize: number;
      orderType?: string;
      orderStatus?: WorkOrderStatus;
      startTime?: Date;
      endTime?: Date;
      level?: number;
    };

    const payload = await verifyAccessToken(req);
    if (!payload) {
      return jsonRes(res, {
        code: 401,
        message: "'token is invaild'"
      });
    }

    let result = await getAllOrdersByUserId({
      userId: payload.userId,
      page: page,
      pageSize: pageSize,
      orderStatus,
      orderType,
      startTime,
      level,
      endTime
    });

    jsonRes(res, {
      data: result
    });
  } catch (error) {
    console.log(error);
    jsonRes(res, { code: 500, error: error });
  }
}
