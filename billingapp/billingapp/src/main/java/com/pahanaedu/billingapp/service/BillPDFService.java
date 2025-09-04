package com.pahanaedu.billingapp.service;

import com.pahanaedu.billingapp.model.Bill;
import com.pahanaedu.billingapp.repository.BillRepository;
import com.pahanaedu.billingapp.util.PdfGeneratorUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class BillPDFService {

    private static final Logger logger = LoggerFactory.getLogger(BillPDFService.class);
    private final BillRepository billRepository;
    private final TemplateEngine templateEngine;

    public BillPDFService(BillRepository billRepository, TemplateEngine templateEngine) {
        this.billRepository = billRepository;
        this.templateEngine = templateEngine;
    }

    public byte[] generateBillPdf(Long billId) {
        try {
            logger.info("Starting PDF generation for bill ID: {}", billId);
            
            Bill bill = billRepository.findById(billId)
                    .orElseThrow(() -> new IllegalArgumentException("Bill not found with ID: " + billId));

            if (bill.getUser() == null) {
                logger.error("Bill {} has no associated user", billId);
                throw new IllegalStateException("Bill has no associated user");
            }

            if (bill.getItems() == null || bill.getItems().isEmpty()) {
                logger.error("Bill {} has no items", billId);
                throw new IllegalStateException("Bill has no items");
            }

            Context context = new Context();
            context.setVariable("bill", bill);

            logger.info("Processing Thymeleaf template for bill ID: {}", billId);
            String html = templateEngine.process("bill-pdf", context);
            
            if (html == null || html.trim().isEmpty()) {
                logger.error("Thymeleaf template processing returned empty HTML for bill ID: {}", billId);
                throw new IllegalStateException("Template processing failed");
            }

            logger.info("Generating PDF from HTML for bill ID: {}", billId);
            byte[] pdfBytes = PdfGeneratorUtil.generatePdfFromHtml(html);
            
            if (pdfBytes == null || pdfBytes.length == 0) {
                logger.error("PDF generation returned null or empty data for bill ID: {}", billId);
                throw new IllegalStateException("PDF generation failed");
            }

            logger.info("PDF generated successfully for bill ID: {}, size: {} bytes", billId, pdfBytes.length);
            return pdfBytes;
            
        } catch (Exception e) {
            logger.error("Error generating PDF for bill ID: {}", billId, e);
            throw new RuntimeException("Failed to generate PDF for bill " + billId, e);
        }
    }
}