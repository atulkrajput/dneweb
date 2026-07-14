<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'DNE Consultants')</title>
    <style>
        /* Reset */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f4f7;
            color: #1a1a2e;
            line-height: 1.6;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f4f4f7;
            padding: 40px 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        /* Header */
        .email-header {
            background-color: #1a1a2e;
            padding: 32px 40px;
            text-align: center;
        }
        .email-header img {
            max-height: 45px;
            width: auto;
        }
        /* Body */
        .email-body {
            padding: 40px;
        }
        .email-body h1 {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 16px;
        }
        .email-body h2 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 12px;
        }
        .email-body p {
            font-size: 15px;
            color: #4a4a68;
            margin-bottom: 16px;
            line-height: 1.7;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .info-table td {
            padding: 12px 16px;
            font-size: 14px;
            border-bottom: 1px solid #eaeaf0;
        }
        .info-table td:first-child {
            font-weight: 600;
            color: #1a1a2e;
            width: 140px;
            white-space: nowrap;
        }
        .info-table td:last-child {
            color: #4a4a68;
        }
        .btn {
            display: inline-block;
            background-color: #6366f1;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            margin-top: 8px;
        }
        .divider {
            border: none;
            border-top: 1px solid #eaeaf0;
            margin: 28px 0;
        }
        /* Footer */
        .email-footer {
            background-color: #f8f8fb;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #eaeaf0;
        }
        .email-footer p {
            font-size: 13px;
            color: #6b6b80;
            margin-bottom: 8px;
            line-height: 1.5;
        }
        .email-footer a {
            color: #6366f1;
            text-decoration: none;
        }
        .social-links {
            margin: 16px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6b6b80;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
        }
        .social-links a:hover {
            color: #6366f1;
        }
        /* Responsive */
        @media only screen and (max-width: 620px) {
            .email-body, .email-footer, .email-header {
                padding: 24px 20px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center">
                    <div class="email-container">
                        <!-- Header with Logo -->
                        <div class="email-header">
                            <img src="{{ config('app.url') }}/logo-white.png" alt="DNE Consultants" />
                        </div>

                        <!-- Email Body -->
                        <div class="email-body">
                            @yield('content')
                        </div>

                        <!-- Footer -->
                        <div class="email-footer">
                            <div class="social-links">
                                <a href="https://facebook.com/dneconsultants">Facebook</a>
                                <a href="https://instagram.com/dneconsultants">Instagram</a>
                                <a href="https://linkedin.com/company/dnetechnologyconsultants-">LinkedIn</a>
                            </div>
                            <p>
                                <strong>DNE Consultants</strong><br>
                                Vancouver, BC, Canada
                            </p>
                            <p>
                                <a href="mailto:letsbuild@dneconsultants.com">letsbuild@dneconsultants.com</a>
                            </p>
                            <p style="margin-top: 16px; font-size: 12px; color: #9999aa;">
                                &copy; {{ date('Y') }} DNE Technology Consultants. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
