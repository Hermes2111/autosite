// This function loads the CSV file
function laadCSV() {
    Papa.parse("collection.csv", {
        download: true,
        header: true,
        complete: function(result) {
            toonModellen(result.data);
        }
    });
}

// This function creates and displays the HTML for each model
function toonModellen(data) {
    const container = document.getElementById('collectie-container');
    container.innerHTML = "";

    data.forEach(model => {
        // Skip rows that are missing the 'what' field or are duplicates of the header
        if (!model.what || model.what === 'what') {
            return;
        }

        const div = document.createElement('div');
        div.classList.add('modelauto');

        let htmlInhoud = `<h3>${model.what} (${model.year})</h3>`;

        // Check if there are image paths in the 'afbeeldingen' column
        if (model['afbeeldingen'] && model['afbeeldingen'].trim() !== '') {
            const afbeeldingen = model['afbeeldingen'].split(',');

            htmlInhoud += `<div class="afbeeldingen-container">`;
            
            // Loop through the image paths from the CSV and create an <img> tag for each
            afbeeldingen.forEach(pad => {
                const trimmedPad = pad.trim();
                if (trimmedPad) {
                    htmlInhoud += `<img src="${trimmedPad}" alt="${model.what}">`;
                }
            });
            
            htmlInhoud += `</div>`;
        }

        // Add the other details (if they exist)
        if (model.scale) {
            htmlInhoud += `<p><strong>Schaal:</strong> ${model.scale}</p>`;
        }
        if (model.specs) {
            htmlInhoud += `<p><strong>Specificaties:</strong> ${model.specs}</p>`;
        }
        if (model.price) {
            htmlInhoud += `<p><strong>Prijs:</strong> €${model.price}</p>`;
        }

        // Always add the contact button
        htmlInhoud += `<a href="mailto:jouwemail@voorbeeld.com?subject=Vraag over ${model.what}" class="contact-button">Vraag over dit model</a>`;

        div.innerHTML = htmlInhoud;
        container.appendChild(div);
    });
}

window.onload = laadCSV;