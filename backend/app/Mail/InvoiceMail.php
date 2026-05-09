<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public Invoice $invoice;
    public string $pdfPath;

    public function __construct(Invoice $invoice, string $pdfPath)
    {
        $this->invoice = $invoice;
        $this->pdfPath = $pdfPath;
    }

    public function build(): self
    {
        return $this->subject('Votre facture - Cabinet Dentaire DentistPro')
            ->view('emails.invoices.send')
            ->attach($this->pdfPath, [
                'as' => 'facture-' . str_pad($this->invoice->id, 5, '0', STR_PAD_LEFT) . '.pdf',
                'mime' => 'application/pdf',
            ]);
    }
}
