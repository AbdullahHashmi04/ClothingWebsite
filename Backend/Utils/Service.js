import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (to, order) => {
  const cartItems = Array.isArray(order.cart) ? order.cart : [];
  const itemRows = cartItems.length
    ? cartItems.map((item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name || 'Item'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">Rs. ${price.toFixed(2)}</td>
        </tr>
      `;
    }).join('')
    : `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;" colspan="3">No items found</td>
      </tr>
    `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <p>Hi <strong>${order.FullName}</strong>,</p>
        <p>Thank you for your order! Here's your summary:</p>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toDateString()}</p>
          <p><strong>Status:</strong> <span style="color: green;">Confirmed ✅</span></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background: #f3f3f3;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: left;">Qty</th>
              <th style="padding: 10px; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 16px;">
          <h3>Total: Rs. ${Number(order.Total || 0).toFixed(2)}</h3>
        </div>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <p><strong>Shipping Address:</strong></p>
          <p>${order.Address}</p>
        </div>

        <p style="margin-top: 24px;">We'll notify you when your order is shipped. 🚚</p>
      </div>

      <!-- Footer -->
      <div style="background: #f3f3f3; padding: 16px; text-align: center; color: #999; font-size: 12px;">
        <p>© 2024 MyApp. All rights reserved.</p>
      </div>

    </div>
  `;

  await transporter.sendMail({
    from: `"Smartify Orders" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmed #${order._id} ✅`,
    html,
  });
};

export { sendOrderConfirmationEmail };