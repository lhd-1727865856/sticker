import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { StickerService } from "@/lib/services/sticker-service";
import { UserService } from "@/lib/services/user-service";

export async function POST(request: Request) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取请求参数
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "请输入贴纸描述" }, { status: 400 });
    }

    // 检查用户余额
    const user = await UserService.getUser(session.user.id);
    if (!user || user.balance <= 0) {
      return NextResponse.json({ error: "余额不足" }, { status: 403 });
    }

    // 调用 AI API 生成图片
    const response = await fetch(`${process.env.AI_API_ENDPOINT}/v1/workflow/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        workflow_id: process.env.COZE_WORKFLOW_ID,
        parameters: {
          title: prompt,
        },
      }),
    });

    // 等待生成完成
    const result = await response.json();
    console.log(result);
    if (result.code !== 0) {
      throw new Error("生成贴图失败,AI繁忙");
    }

    const {url} = JSON.parse(result.data);

    if (!url) {
      throw new Error("生成图片失败");
    }

    // 创建贴纸记录并扣除余额
    const sticker = await StickerService.createSticker(session.user.id, prompt, url);

    return NextResponse.json(sticker);
  } catch (error: any) {
    console.error("生成贴纸失败:", error);
    return NextResponse.json(
      { error: error.message || "生成贴纸失败" },
      { status: 500 }
    );
  }
}
