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
        // console.log("Questions No:", q.question_number);
    });

    //console.log("Selected Questions:", selectedQuestions);

    generateQCABPDF(selectedQuestions);
});

function generateQCABPDF(questions) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageHeight = 297, pageWidth = 210;
    const leftMargin = 25, rightMargin = 185, topMargin = 15, bottomMargin = 282;
    let page = 1;

    doc.setFont("Times", "Roman");
    doc.setFontSize(12);

    // ---------- PART 1: Render Question Listing ----------
    // let currentY = topMargin;
    // const localWidth = rightMargin - leftMargin +4; 
    // const lineHeight = 6; // or set according to your font size and line spacing

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
            // const footerText2 = ${page};
            // page++;
            doc.setFontSize(8);
            doc.text(footerText, leftMargin - 10, bottomMargin + 3);
            doc.text(String(page+p), rightMargin + 10, bottomMargin + 3);

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
            } else if (p!=pagesNeeded-1){
                // Right Margin Text (only for continuation pages)
                const localWidth = 23;
                const splitText = doc.splitTextToSize(
                    "Candidates must not write on this margin",
                    localWidth
                );
                let currentY = topMargin + 5;
                doc.text(splitText, rightMargin + 2, currentY);
            }else {
                // Right Margin Text (for marks page)
                const localWidth = 23;
                const startMargin = topMargin+5;
                const marginSize = 20;
                doc.text(doc.splitTextToSize("Demand addressed-",localWidth), rightMargin + 2, startMargin);
                doc.text(doc.splitTextToSize("Left any dimension-",localWidth), rightMargin + 2, startMargin+marginSize);
                doc.text(doc.splitTextToSize("nReadability-",localWidth), rightMargin + 2, startMargin+2*marginSize);
                doc.text(doc.splitTextToSize("Introduction-",localWidth), rightMargin + 2, startMargin+3*marginSize);
                doc.text(doc.splitTextToSize("Conclusion-",localWidth), rightMargin + 2, startMargin+4*marginSize);
            }
        }
        page+=pagesNeeded;
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
