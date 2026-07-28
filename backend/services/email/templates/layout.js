/**
 * Shared HTML Email Layout Wrapper
 * @param {Object} options
 * @param {string} options.title - Email Header Title
 * @param {string} options.bodyContent - Main HTML body content of the email
 * @returns {string} Complete HTML document
 */
export const wrapEmailLayout = ({ title, bodyContent }) => {
  const appName = process.env.APP_NAME || 'MERN Shop';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .email-header {
      background-color: #1a202c;
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .email-body {
      padding: 32px 24px;
      color: #2d3748;
      line-height: 1.6;
      font-size: 15px;
    }
    .email-body h2 {
      color: #1a202c;
      font-size: 18px;
      margin-top: 0;
    }
    .btn {
      display: inline-block;
      background-color: #3182ce;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .order-table th, .order-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
    .order-table th {
      background-color: #f7fafc;
      color: #4a5568;
      font-size: 13px;
      text-transform: uppercase;
    }
    .email-footer {
      background-color: #edf2f7;
      color: #718096;
      padding: 16px;
      text-align: center;
      font-size: 13px;
    }
    .email-footer a {
      color: #3182ce;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${appName}</h1>
    </div>
    <div class="email-body">
      ${bodyContent}
    </div>
    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      <p><a href="${clientUrl}">${clientUrl}</a></p>
    </div>
  </div>
</body>
</html>
  `;
};
