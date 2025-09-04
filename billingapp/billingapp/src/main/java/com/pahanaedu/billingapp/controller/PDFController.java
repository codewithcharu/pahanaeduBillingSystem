package com.pahanaedu.billingapp.controller;

import com.pahanaedu.billingapp.service.BillPDFService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pdf")
public class PDFController {

    private static final Logger logger = LoggerFactory.getLogger(PDFController.class);
    private final BillPDFService billPDFService;

    public PDFController(BillPDFService billPDFService) {
        this.billPDFService = billPDFService;
    }

    @GetMapping("/bill/{billId}")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long billId) {
        try {
            logger.info("Generating PDF for bill ID: {}", billId);
            byte[] pdf = billPDFService.generateBillPdf(billId);
            
            if (pdf == null || pdf.length == 0) {
                logger.error("PDF generation returned null or empty data for bill ID: {}", billId);
                return ResponseEntity.internalServerError().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice_" + billId + ".pdf");
            headers.setContentLength(pdf.length);

            logger.info("PDF generated successfully for bill ID: {}, size: {} bytes", billId, pdf.length);
            return ResponseEntity.ok().headers(headers).body(pdf);
            
        } catch (Exception e) {
            logger.error("Error generating PDF for bill ID: {}", billId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

