import nodemailer from 'nodemailer';

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: true, // QQ邮箱需要启用SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    // 不验证证书
    rejectUnauthorized: false
  },
  debug: true, // 启用调试
  logger: true // 启用日志
});

export class EmailService {
  // 测试邮件连接
  static async verifyConnection() {
    try {
      console.log('正在验证邮件服务器连接...');
      console.log('配置信息:', {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        user: process.env.EMAIL_SERVER_USER,
        // 不要打印密码
      });

      await transporter.verify();
      console.log('邮件服务器连接成功');
      return true;
    } catch (error) {
      console.error('邮件服务器连接失败:', error);
      // 打印更详细的错误信息
      if (error instanceof Error) {
        console.error('错误详情:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      return false;
    }
  }

  static async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`;

    const mailOptions = {
      from: `"创意贴纸工坊" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '验证您的邮箱 - 创意贴纸工坊',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4a9eff; margin: 0;">创意贴纸工坊</h1>
            <p style="color: #666; font-size: 16px;">邮箱验证</p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">欢迎加入创意贴纸工坊！</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              感谢您注册创意贴纸工坊。请点击下面的按钮验证您的邮箱地址：
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4a9eff; 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        font-size: 16px;
                        font-weight: bold;
                        display: inline-block;">
                验证邮箱
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 5px;">
              如果按钮无法点击，请复制以下链接到浏览器中打开：
            </p>
            <p style="color: #4a9eff; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
          </div>
          
          <div style="color: #999; font-size: 14px; text-align: center;">
            <p style="margin-bottom: 10px;">
              如果您没有注册创意贴纸工坊，请忽略此邮件。
            </p>
            <p style="margin: 0;">
              此链接将在30分钟后失效。如果链接已过期，请重新登录并点击"重新发送验证邮件"。
            </p>
          </div>
        </div>
      `,
    };

    try {
      console.log('正在发送验证邮件到:', email);
      await transporter.sendMail(mailOptions);
      console.log('验证邮件发送成功:', email);
    } catch (error) {
      console.error('发送验证邮件失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw new Error('发送验证邮件失败，请稍后重试');
    }
  }
} 