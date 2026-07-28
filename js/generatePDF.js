// generatePDF.js

document.getElementById("generateQCAB").addEventListener("click", () => {
    if (typeof window.getSelectedQuestions !== "function") {
        alert("Selection logic not loaded!");
        return;
    }

    const selectedQuestions = window.getSelectedQuestions();
    if (selectedQuestions.length === 0) {
        alert("Select questions first!");
        return;
    }

    // Sort by marks if you still want that order, else comment next line
    selectedQuestions.sort((a, b) => a.marks - b.marks);

    // Ensure sequential numbering (1,2,3...)
    selectedQuestions.forEach((q, i) => {
        q.question_number = i + 1;
        console.log("Questions No:", q.question_number);
    });

    //console.log("Selected Questions:", selectedQuestions);

    generateQCABPDF(selectedQuestions);
});

function generateQCABPDF(questions) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageHeight = 297, pageWidth = 210;
    const leftMargin = 25, rightMargin = 185, topMargin = 15, bottomMargin = 282;

    doc.setFont("Times", "Roman");
    doc.setFontSize(12);

    // ---------- PART 1: Render Question Listing ----------
    let currentY = topMargin;
    const localWidth = rightMargin - leftMargin +4; 
    const lineHeight = 6; // or set according to your font size and line spacing

    questions.forEach((q, index) => {
        // Format question text
        const qHeader = `${q.question_number}. `;
        const qText = `${q.question_text}   [${q.marks} M / ${q.year}]`;
        console.log( "Questions:",qHeader,"----", qText);
        // Split text to fit within width
        const splitText = doc.splitTextToSize(qText, localWidth);
        const totalHeight = splitText.length * lineHeight + lineHeight;

        // Add new page if content exceeds bottom margin
        if (currentY + totalHeight > pageHeight - 15) {
            doc.addPage();
            currentY = topMargin;
        }

        // Draw question number and text
        doc.text(qHeader, leftMargin - 10, currentY);
        doc.text(splitText, leftMargin + 2, currentY);

        // Update Y position
        currentY += totalHeight; // spacing between questions
    });

    // ---------- PART 2: Render QCAB Pages ----------

    questions.forEach((q) => {
        const pagesNeeded = Math.ceil(q.marks / 6);

        for (let p = 0; p < pagesNeeded; p++) {
            doc.addPage();

            // Margins
            doc.setLineWidth(0.3);
            doc.line(leftMargin, topMargin, leftMargin, bottomMargin);
            doc.line(rightMargin, topMargin, rightMargin, bottomMargin);

            // Footer
            const footerText = `XXXX-${q.question_id}`;
            doc.setFontSize(8);
            doc.text(footerText, leftMargin - 10, bottomMargin + 3);

            if (p === 0) {
                // Left Question Number
                doc.setFontSize(12);
                doc.text(`Q. ${q.question_number}`, leftMargin - 15, topMargin + 5);

                // Question Text
                const localWidth = rightMargin - leftMargin - 4;
                const questionText = `${q.question_text}`;
                const splitText = doc.splitTextToSize(questionText, localWidth);
                let currentY = topMargin + 5;
                doc.text(splitText, leftMargin + 2, currentY);

                // Marks / Word limit / Year (right margin top)
                currentY = topMargin + 5;
                doc.text(`${q.marks} M / ${q.year}`, rightMargin + 2, currentY);
            } else {
                // Right Margin Text (only for continuation pages)
                const localWidth = 23;
                const splitText = doc.splitTextToSize(
                    "Candidates must not write on this margin",
                    localWidth
                );
                let currentY = topMargin + 5;
                doc.text(splitText, rightMargin + 2, currentY);
            }
        }
    });

    window.generatedPDF = doc;
    if (window.generatedPDF) {
        window.generatedPDF.save("QCAB.pdf");
    }
    //document.getElementById("downloadPDF").style.display = "inline-block";
    //alert("QCAB PDF generated! Click 'Download QCAB PDF' to save.");
}

document.getElementById("downloadPDF").addEventListener("click", () => {
    if (window.generatedPDF) {
        window.generatedPDF.save("QCAB.pdf");
        // hide again after downloading
        document.getElementById("downloadPDF").style.display = "none";
    }
});
