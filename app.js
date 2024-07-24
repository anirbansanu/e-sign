const canvas = document.getElementById('signature-pad');
const signaturePad = new SignaturePad(canvas);

document.getElementById('clear').addEventListener('click', () => {
    signaturePad.clear();
});

document.getElementById('view').addEventListener('click', async () => {
    if (signaturePad.isEmpty()) {
        alert('Please provide a signature first.');
        return;
    }

    // Convert signature to PNG image
    const signatureImage = signaturePad.toDataURL('image/png');

    // Fetch the existing PDF document
    const existingPdfBytes = await fetch('cover-letter.pdf').then(res => res.arrayBuffer());

    // Load the existing PDF and add the signature image
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const pngImageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    const pngDims = pngImage.scale(0.5);

    firstPage.drawImage(pngImage, {
        x: firstPage.getWidth() / 2 - pngDims.width / 2,
        y: firstPage.getHeight() / 2 - pngDims.height / 2,
        width: pngDims.width,
        height: pngDims.height,
    });

    // Serialize the PDF document to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Create a Blob URL for the PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Display the PDF in an iframe
    const pdfViewer = document.getElementById('pdf-viewer');
    pdfViewer.src = url;
});
