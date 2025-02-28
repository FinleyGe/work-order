import { generateAccessToken, verifyToken } from '@/services/backend/auth';
import { jsonRes } from '@/services/backend/response';
import { createUser, getUserById, updateUser } from '@/services/db/user';
import { AppSession, TokenPayload } from '@/types/user';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token } = req.body as { token: string };
    const payload = await verifyToken<TokenPayload>(token);

    if (!payload) {
      return jsonRes(res, {
        code: 401,
        message: 'verify  token error'
      });
    }

    const existingUser = await getUserById(payload.userId);

    if (existingUser) {
      // update the userlevel
      await updateUser(existingUser.userId, existingUser.username, {
        level: payload.level
      });

      const token = generateAccessToken(existingUser);
      return jsonRes<AppSession>(res, {
        code: 200,
        data: {
          token,
          userId: existingUser.userId,
          isAdmin: existingUser.isAdmin,
          username: existingUser.username
        }
      });
    }

    const isAdmin = payload.username === 'root';
    await createUser({
      level: payload.level,
      userId: payload.userId,
      username: payload.username,
      domain: payload.domain,
      teamId: payload.teamId,
      isAdmin
    });

    jsonRes<AppSession>(res, {
      code: 200,
      data: {
        token,
        userId: payload.userId,
        isAdmin: false,
        username: payload.username
      }
    });
  } catch (error) {
    jsonRes(res, { code: 500, error: error });
  }
}
