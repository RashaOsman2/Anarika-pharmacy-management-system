import { Receipt } from '@/types/pharmacy';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Download } from 'lucide-react';
import { numberToWords } from '@/lib/numberToWords';
import { useRef } from 'react';

interface ReceiptModalProps {
  receipt: Receipt | null;
  open: boolean;
  onClose: () => void;
  amountPaid?: number;
  sellerName?: string;
}

const formatQuantityForReceipt = (item: Receipt['items'][0]) => {
  if (item.unit_type === 'strip') {
    if (item.sold_as === 'strip') {
      const strips = item.quantity / (item.pieces_per_unit || 10);
      return `${strips} strip${strips !== 1 ? 's' : ''}`;
    }
    return `${item.quantity} pc${item.quantity !== 1 ? 's' : ''}`;
  }
  return `${item.quantity} ${item.unit_type || 'unit'}${item.quantity !== 1 ? 's' : ''}`;
};

export default function ReceiptModal({ 
  receipt, 
  open, 
  onClose,
  amountPaid,
  sellerName = 'Counter'
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  if (!receipt) return null;

  const customerName = receipt.customer_name || 'Walk-in Customer';
  const customerPhone = receipt.customer_phone || 'N/A';
  
  const subtotal = receipt.items.reduce((sum, item) => sum + (item.original_price || item.total_price), 0);
  const totalDiscount = subtotal - receipt.total;
  const paid = amountPaid ?? receipt.total;
  const due = Math.max(0, receipt.total - paid);
  
  const receiptDate = new Date(receipt.date);
  const formattedDate = receiptDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = receiptDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.receipt_number}</title>
          <style>
            @page {
              size: 78mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.3;
              width: 78mm;
              padding: 3mm;
              background: white;
              color: black;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .shop-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .shop-address {
              font-size: 10px;
              margin-bottom: 2px;
            }
            .shop-phone {
              font-size: 10px;
              font-weight: bold;
            }
            .receipt-title {
              text-align: center;
              font-size: 13px;
              font-weight: bold;
              margin: 8px 0;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
            }
            .meta-info {
              font-size: 10px;
              margin-bottom: 8px;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .meta-label {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              margin-bottom: 8px;
            }
            th {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 4px 2px;
              text-align: left;
              font-weight: bold;
            }
            th:last-child, td:last-child {
              text-align: right;
            }
            th:nth-child(3), td:nth-child(3),
            th:nth-child(4), td:nth-child(4) {
              text-align: right;
            }
            td {
              padding: 3px 2px;
              vertical-align: top;
            }
            .medicine-name {
              max-width: 100px;
              word-wrap: break-word;
            }
            .totals-section {
              border-top: 1px dashed #000;
              padding-top: 8px;
              margin-bottom: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 10px;
            }
            .total-row.main {
              font-size: 12px;
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 4px;
              margin-top: 4px;
            }
            .amount-words {
              font-size: 9px;
              font-style: italic;
              margin: 8px 0;
              padding: 4px;
              border: 1px dashed #000;
              text-align: center;
            }
            .bangla-notice {
              font-size: 9px;
              text-align: center;
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px dashed #000;
              line-height: 1.5;
            }
            .thank-you {
              text-align: center;
              font-weight: bold;
              margin-top: 10px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    // Use print to PDF functionality
    handlePrint();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Preview Container */}
        <div className="max-h-[70vh] overflow-y-auto bg-white p-4">
          <div ref={receiptRef} className="thermal-receipt">
            {/* Header */}
            <div className="receipt-header">
              <div className="shop-name">ANARIKA PHARMA</div>
              <div className="shop-address">Beron Road, Jamgora, Ashulia, Dhaka</div>
              <div className="shop-phone">Help Line: +8801316604079</div>
            </div>

            {/* Title */}
            <div className="receipt-title">Medicine Money Receipt</div>

            {/* Meta Information */}
            <div className="meta-info">
              <div className="meta-row">
                <span className="meta-label">Bill No:</span>
                <span>{receipt.receipt_number}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Date:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Time:</span>
                <span>{formattedTime}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Customer:</span>
                <span>{customerName}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Contact:</span>
                <span>{customerPhone}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Seller:</span>
                <span>{sellerName}</span>
              </div>
            </div>

            {/* Medicine Table */}
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Medicine Name</th>
                  <th>Qty</th>
                  <th>MRP</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="medicine-name">{item.medicine_name}</td>
                    <td>{formatQuantityForReceipt(item)}</td>
                    <td>৳{item.unit_price.toFixed(0)}</td>
                    <td>৳{item.total_price.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="totals-section">
              <div className="total-row">
                <span>Item Value:</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Discount:</span>
                <span>-৳{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Net Amount:</span>
                <span>৳{receipt.total.toFixed(2)}</span>
              </div>
              <div className="total-row main">
                <span>Payable:</span>
                <span>৳{receipt.total.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Amount Paid:</span>
                <span>৳{paid.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Due Amount:</span>
                <span>৳{due.toFixed(2)}</span>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="amount-words">
              In word: {numberToWords(receipt.total)}
            </div>

            {/* Bangla Notice */}
            <div className="bangla-notice">
              বি.দ্রঃ ইনসুলিন, ইনজেকশন, ফ্রিজিং আইটেম ও কাটা ছেঁড়া<br />
              মেডিসিন পরিবর্তন যোগ্য নয়।<br />
              পণ্য পরিবর্তনের জন্য অবশ্যই ক্যাশ মেমো প্রদর্শন করতে হবে।<br />
              পণ্য ফেরত নগদ টাকা দেওয়া হয় না।
            </div>

            {/* Thank You */}
            <div className="thank-you">
              Thank You! Visit Again
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t bg-muted/30">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}