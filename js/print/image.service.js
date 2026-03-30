export async function saveImage(element) {

const canvas = await html2canvas(element, { scale: 2 });

let quality = 0.7;
let data;

do {
    data = canvas.toDataURL('image/jpeg', quality);
    quality -= 0.05;
} while (data.length > 200000);

const link = document.createElement('a');
link.download = "invoice.jpg";
link.href = data;
link.click();

}
