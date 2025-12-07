// @ts-nocheck
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Use SMTP settings from environment variables
    // Supports any SMTP provider: SendGrid, Mailgun, AWS SES, Resend, etc.
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log('Email service: SMTP not configured. Emails will be logged to console.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;
    const from = process.env.EMAIL_FROM || 'BlayStorm <noreply@blaystorm.com>';

    if (!this.transporter) {
      // Log email for development/testing
      console.log('=== EMAIL (Not sent - SMTP not configured) ===');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text || html}`);
      console.log('==============================================');
      return true; // Return true to not break the flow
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });
      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const name = userName || 'Math Champion';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 BlayStorm</h1>
            </div>
            <div class="content">
              <h2>Hey ${name}! 👋</h2>
              <p>We received a request to reset your password. No worries - it happens to the best of us!</p>
              <p>Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this, you can safely ignore this email. Your password won't change.</p>
              <p>Keep being awesome! 🌟</p>
            </div>
            <div class="footer">
              <p>BlayStorm - The Roblox of Math</p>
              <p>If the button doesn't work, copy and paste this link: ${resetUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🔐 Reset Your BlayStorm Password',
      html,
    });
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .feature { display: flex; align-items: center; margin: 15px 0; }
            .feature-icon { font-size: 24px; margin-right: 15px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 Welcome to BlayStorm!</h1>
            </div>
            <div class="content">
              <h2>Hey ${userName}! 🎉</h2>
              <p>Welcome to the most epic math adventure ever! You're now part of the BlayStorm family.</p>

              <h3>Here's what awaits you:</h3>
              <div class="feature">
                <span class="feature-icon">🐾</span>
                <span><strong>Collect Pets</strong> - Over 20 adorable companions to discover!</span>
              </div>
              <div class="feature">
                <span class="feature-icon">👕</span>
                <span><strong>Customize Your Avatar</strong> - Express yourself with 40+ items!</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🗡️</span>
                <span><strong>Battle Bosses</strong> - Test your skills against epic math monsters!</span>
              </div>
              <div class="feature">
                <span class="feature-icon">⚔️</span>
                <span><strong>Challenge Friends</strong> - Compete in 1v1 math battles!</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🏰</span>
                <span><strong>Join a Guild</strong> - Team up and conquer together!</span>
              </div>

              <p style="text-align: center;">
                <a href="${loginUrl}" class="button">Start Your Adventure!</a>
              </p>

              <p>See you in the game! 🚀</p>
            </div>
            <div class="footer">
              <p>BlayStorm - The Roblox of Math</p>
              <p>Making math fun, one problem at a time!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎮 Welcome to BlayStorm - Your Math Adventure Begins!',
      html,
    });
  }

  async sendEmailVerification(email: string, verifyToken: string, userName?: string): Promise<boolean> {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verifyToken}`;
    const name = userName || 'Math Champion';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 BlayStorm</h1>
            </div>
            <div class="content">
              <h2>Almost there, ${name}! ✨</h2>
              <p>Just one more step to unlock your full BlayStorm experience!</p>
              <p>Click the button below to verify your email address:</p>
              <p style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify My Email</a>
              </p>
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>🎁 Receive exclusive rewards</li>
                <li>🔔 Get notifications about your progress</li>
                <li>🔒 Keep your account secure</li>
              </ul>
            </div>
            <div class="footer">
              <p>BlayStorm - The Roblox of Math</p>
              <p>If the button doesn't work, copy and paste this link: ${verifyUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '✉️ Verify Your BlayStorm Email',
      html,
    });
  }

  async sendStreakReminderEmail(email: string, userName: string, currentStreak: number): Promise<boolean> {
    const playUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/play`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .streak-badge { font-size: 48px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔥 Don't Break Your Streak!</h1>
            </div>
            <div class="content">
              <h2>Hey ${userName}! 👋</h2>
              <div class="streak-badge">🔥 ${currentStreak} Days</div>
              <p style="text-align: center; font-size: 18px;"><strong>You're on a ${currentStreak}-day streak!</strong></p>
              <p>Don't let all that hard work go to waste! Play today to keep your streak alive and earn bonus rewards!</p>
              <p style="text-align: center;">
                <a href="${playUrl}" class="button">Keep My Streak! 🔥</a>
              </p>
              <p>Remember: The longer your streak, the better your rewards!</p>
            </div>
            <div class="footer">
              <p>BlayStorm - The Roblox of Math</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `🔥 ${userName}, your ${currentStreak}-day streak is at risk!`,
      html,
    });
  }

  async sendWeeklyReportEmail(
    email: string,
    userName: string,
    stats: {
      problemsSolved: number;
      accuracy: number;
      xpEarned: number;
      levelsGained: number;
      timeSpent: number;
    }
  ): Promise<boolean> {
    const { problemsSolved, accuracy, xpEarned, levelsGained, timeSpent } = stats;
    const timeSpentMinutes = Math.round(timeSpent / 60);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-value { font-size: 24px; font-weight: bold; color: #11998e; }
            .stat-label { font-size: 12px; color: #666; }
            .button { display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Weekly Report</h1>
            </div>
            <div class="content">
              <h2>Great work this week, ${userName}! 🌟</h2>
              <p>Here's how you crushed it:</p>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${problemsSolved}</div>
                  <div class="stat-label">Problems Solved</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${accuracy}%</div>
                  <div class="stat-label">Accuracy</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${xpEarned.toLocaleString()}</div>
                  <div class="stat-label">XP Earned</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${timeSpentMinutes} min</div>
                  <div class="stat-label">Time Played</div>
                </div>
              </div>

              ${levelsGained > 0 ? `<p style="text-align: center; font-size: 18px;">🎉 You gained <strong>${levelsGained} level${levelsGained > 1 ? 's' : ''}</strong> this week!</p>` : ''}

              <p>Keep up the amazing progress! Every problem you solve makes you stronger! 💪</p>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/play" class="button">Continue Learning!</a>
              </p>
            </div>
            <div class="footer">
              <p>BlayStorm - The Roblox of Math</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `📊 ${userName}'s Weekly Math Report - ${problemsSolved} Problems Solved!`,
      html,
    });
  }
}

export default new EmailService();
