export default function downloadQuotePDF(quoteData: any) {
const { provider, pickup, dropoff, distanceResult, vehicle, helpersNeeded, moveType, instantEstimate } = quoteData;
  const displayName = provider?.company || (provider?.user ? `${provider.user.firstName} ${provider.user.lastName}` : "Moving Company");
  
  // Create a hidden iframe for PDF generation
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;
  
  // Generate premium PDF-friendly HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Moving Quote - ${displayName}</title>
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.6;
          color: #1f2937;
          background: white;
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          position: relative;
        }
        
        /* Hero Header with Gradient */
        .hero-header {
          background: linear-gradient(135deg, #61d345 0%, #4bc22f 50%, #3ab024 100%);
          padding: 40px 50px;
          position: relative;
          overflow: hidden;
        }
        
        .hero-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.05)"/></svg>') repeat;
          opacity: 0.3;
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
        }
        
        .hero-header h1 {
          font-size: 36pt;
          color: white;
          font-weight: 700;
          letter-spacing: -1px;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .hero-header .subtitle {
          font-size: 13pt;
          color: rgba(255,255,255,0.95);
          font-weight: 400;
          letter-spacing: 0.5px;
        }
        
        .company-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 30px;
          margin-top: 20px;
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .company-badge span {
          color: white;
          font-size: 14pt;
          font-weight: 600;
        }
        
        /* Quote Meta Info Bar */
        .meta-bar {
          background: #f9fafb;
          padding: 20px 50px;
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #e5e7eb;
        }
        
        .meta-item {
          text-align: center;
        }
        
        .meta-label {
          font-size: 8pt;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          font-weight: 600;
        }
        
        .meta-value {
          font-size: 11pt;
          color: #61d345;
          font-weight: 700;
        }
        
        /* Main Content */
        .content {
          padding: 35px 50px;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .section-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #61d345 0%, #4bc22f 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          box-shadow: 0 4px 6px rgba(97, 211, 69, 0.25);
        }
        
        .section-icon svg {
          width: 20px;
          height: 20px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }
        
        .section-title {
          font-size: 15pt;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
        }
        
        /* Info Cards */
        .info-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid #61d345;
          margin-bottom: 15px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-item {
          padding: 12px 0;
        }
        
        .info-item.full-width {
          grid-column: 1 / -1;
        }
        
        .info-label {
          font-size: 8.5pt;
          color: #4bc22f;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 11pt;
          color: #1f2937;
          font-weight: 600;
        }
        
        /* Vehicle Card */
        .vehicle-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          gap: 20px;
          align-items: center;
        }
        
        .vehicle-icon-box {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #61d345 0%, #4bc22f 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(97, 211, 69, 0.3);
          flex-shrink: 0;
        }
        
        .vehicle-icon-box svg {
          width: 40px;
          height: 40px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }
        
        .vehicle-details {
          flex: 1;
        }
        
        .vehicle-name {
          font-size: 13pt;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }
        
        .vehicle-specs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 12px;
        }
        
        .vehicle-spec {
          background: #f9fafb;
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
        }
        
        .vehicle-spec-label {
          font-size: 7.5pt;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }
        
        .vehicle-spec-value {
          font-size: 10pt;
          color: #111827;
          font-weight: 700;
        }
        
        /* Pricing Table */
        .pricing-card {
          background: white;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }
        
        .pricing-header {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 15px 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .pricing-header-title {
          font-size: 12pt;
          font-weight: 700;
          color: #111827;
        }
        
        .pricing-row {
          display: flex;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }
        
        .pricing-row:last-child {
          border-bottom: none;
        }
        
        .pricing-label {
          font-size: 10pt;
          color: #4b5563;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .pricing-label .detail {
          color: #9ca3af;
          font-size: 9pt;
        }
        
        .pricing-value {
          font-size: 11pt;
          color: #111827;
          font-weight: 700;
        }
        
        /* Total Section - Grand Finale */
        .total-section {
          background: linear-gradient(135deg, #61d345 0%, #4bc22f 50%, #3ab024 100%);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
          margin-top: 25px;
          box-shadow: 0 10px 25px rgba(97, 211, 69, 0.35);
        }
        
        .total-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        
        .total-content {
          position: relative;
          z-index: 1;
        }
        
        .total-label {
          font-size: 11pt;
          color: rgba(255,255,255,0.9);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .total-amount {
          font-size: 48pt;
          color: white;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 8px;
          text-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .total-subtext {
          font-size: 9pt;
          color: rgba(255,255,255,0.85);
          font-weight: 500;
        }
        
        /* Terms Box */
        .terms-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          padding: 20px;
          margin-top: 25px;
          border: 2px solid #fcd34d;
        }
        
        .terms-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .terms-icon {
          width: 24px;
          height: 24px;
          background: #f59e0b;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .terms-icon svg {
          width: 14px;
          height: 14px;
          stroke: white;
          stroke-width: 2.5;
          fill: none;
        }
        
        .terms-title {
          font-size: 11pt;
          font-weight: 700;
          color: #92400e;
        }
        
        .terms-list {
          margin-left: 20px;
          color: #78350f;
        }
        
        .terms-list li {
          margin-bottom: 6px;
          font-size: 9pt;
          line-height: 1.5;
        }
        
        /* Contact Footer */
        .contact-footer {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
        }
        
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 15px;
        }
        
        .contact-item {
          background: #f9fafb;
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #e5e7eb;
        }
        
        .contact-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #61d345 0%, #4bc22f 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .contact-icon svg {
          width: 16px;
          height: 16px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }
        
        .contact-info {
          flex: 1;
        }
        
        .contact-label {
          font-size: 7.5pt;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }
        
        .contact-value {
          font-size: 10pt;
          color: #111827;
          font-weight: 600;
        }
        
        /* Footer */
        .footer {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 25px 50px;
          text-align: center;
          margin-top: 40px;
        }
        
        .footer-text {
          font-size: 10pt;
          color: #6b7280;
          line-height: 1.8;
        }
        
        .footer-text strong {
          color: #059669;
          font-weight: 700;
        }
        
        .footer-tagline {
          margin-top: 8px;
          font-size: 9pt;
          color: #9ca3af;
          font-style: italic;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Hero Header -->
        <div class="hero-header">
          <div class="hero-content">
            <h1>MOVING QUOTE</h1>
            <div class="subtitle">Professional Moving Services</div>
            <div class="company-badge">
              <span>${displayName}</span>
            </div>
          </div>
        </div>
        
        <!-- Meta Info Bar -->
        <div class="meta-bar">
          <div class="meta-item">
            <div class="meta-label">Quote Date</div>
            <div class="meta-value">${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Reference No.</div>
            <div class="meta-value">QT-${Date.now().toString().slice(-8)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Valid Until</div>
            <div class="meta-value">${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <!-- Route Section -->
          <div class="section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div class="section-title">Journey Details</div>
            </div>
            
            <div class="info-card">
              <div class="info-grid">
                <div class="info-item full-width">
                  <div class="info-label">📍 Pickup Location</div>
                  <div class="info-value">${pickup}</div>
                </div>
                <div class="info-item full-width">
                  <div class="info-label">📍 Dropoff Location</div>
                  <div class="info-value">${dropoff}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">🛣️ Distance</div>
                  <div class="info-value">${distanceResult.distanceText}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">⏱️ Estimated Time</div>
                  <div class="info-value">${distanceResult.durationText}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vehicle Section -->
          <div class="section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3zM8 6H4v5h4V6z"/>
                </svg>
              </div>
              <div class="section-title">Vehicle Information</div>
            </div>
            
            <div class="vehicle-card">
              <div class="vehicle-icon-box">
                <svg viewBox="0 0 24 24">
                  <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3z"/>
                </svg>
              </div>
              <div class="vehicle-details">
                <div class="vehicle-name">${vehicle?.type.replace(/_/g, ' ')} • ${vehicle?.plate}</div>
                <div class="vehicle-specs">
                  <div class="vehicle-spec">
                    <div class="vehicle-spec-label">Capacity</div>
                    <div class="vehicle-spec-value">${vehicle?.capacity} m³</div>
                  </div>
                  <div class="vehicle-spec">
                    <div class="vehicle-spec-label">Max Weight</div>
                    <div class="vehicle-spec-value">${vehicle?.weight} kg</div>
                  </div>
                  <div class="vehicle-spec">
                    <div class="vehicle-spec-label">Move Type</div>
                    <div class="vehicle-spec-value">${moveType.replace(/_/g, ' ')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pricing Section -->
          <div class="section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <div class="section-title">Cost Breakdown</div>
            </div>
            
            <div class="pricing-card">
              <div class="pricing-header">
                <div class="pricing-header-title">Service Charges</div>
              </div>
              <div class="pricing-row">
                <div class="pricing-label">
                  Base Rate
                </div>
                <div class="pricing-value">R${vehicle?.baseRate}</div>
              </div>
              <div class="pricing-row">
                <div class="pricing-label">
                  Distance Charge
                  <span class="detail">(${distanceResult.distance.toFixed(1)} km × R${vehicle?.perKmRate}/km)</span>
                </div>
                <div class="pricing-value">R${(distanceResult.distance * (vehicle?.perKmRate || 0)).toFixed(2)}</div>
              </div>
              ${helpersNeeded > 0 ? `
              <div class="pricing-row">
                <div class="pricing-label">
                  Moving Helpers
                  <span class="detail">(${helpersNeeded} × R150)</span>
                </div>
                <div class="pricing-value">R${(helpersNeeded * 150).toFixed(2)}</div>
              </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Total Section -->
          <div class="total-section">
            <div class="total-content">
              <div class="total-label">Total Estimated Cost</div>
              <div class="total-amount">R${instantEstimate.toFixed(2)}</div>
              <div class="total-subtext">All charges included • Valid for 14 days</div>
            </div>
          </div>
          
          <!-- Terms & Conditions -->
          <div class="terms-box">
            <div class="terms-header">
              <div class="terms-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <div class="terms-title">Important Terms & Conditions</div>
            </div>
            <ul class="terms-list">
              <li>This quotation is valid for 14 days from the date of issue and subject to availability</li>
              <li>Final pricing may vary based on actual route conditions, additional services, or unforeseen circumstances</li>
              <li>A deposit may be required to secure your booking date and confirm the service</li>
              <li>Cancellation and rescheduling policies apply as per our standard terms of service</li>
              <li>Comprehensive insurance coverage is available upon request for valuable items</li>
            </ul>
          </div>
          
          <!-- Contact Section -->
          <div class="contact-footer">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="section-title">Get In Touch</div>
            </div>
            
            <div class="contact-grid">
              ${provider?.user?.phone ? `
              <div class="contact-item">
                <div class="contact-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div class="contact-info">
                  <div class="contact-label">Phone</div>
                  <div class="contact-value">${provider.user.phone}</div>
                </div>
              </div>
              ` : ''}
              ${provider?.user?.email ? `
              <div class="contact-item">
                <div class="contact-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div class="contact-info">
                  <div class="contact-label">Email</div>
                  <div class="contact-value">${provider.user.email}</div>
                </div>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">
            <strong>Thank you for choosing ${displayName}!</strong><br>
            We're committed to making your move smooth, efficient, and stress-free.
          </div>
          <div class="footer-tagline">
            Moving forward together • Professional service you can trust
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    
    // Clean up after printing or canceling
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);
}