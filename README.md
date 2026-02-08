
<html>
<head>
    <title>ჩემი ფოტო ალბომი</title>
    <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-5">
    <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-3xl font-bold mb-8">ჩემი High-Res გალერეა</h1>
        
        <button id="upload_widget" class="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg mb-10">
            ფოტოს დამატება (ორიგინალი ხარისხით)
        </button>

        <div id="gallery" class="columns-1 md:columns-3 gap-4 space-y-4"></div>
    </div>

    <script>
        const cloudName = "შენი_CLOUD_NAME"; // ჩაწერე შენი აქ
        const uploadPreset = "my_preset"; // შენი პრესეტის სახელი

        const myWidget = cloudinary.createUploadWidget({
            cloudName: cloudName, 
            uploadPreset: uploadPreset,
            clientAllowedFormats: ["jpg", "png", "jpeg"],
            quality: "original" // ინარჩუნებს მაქსიმალურ ხარისხს
        }, (error, result) => { 
            if (!error && result && result.event === "success") { 
                addPhotoToGallery(result.info.secure_url);
            }
        });

        document.getElementById("upload_widget").addEventListener("click", () => myWidget.open());

        function addPhotoToGallery(url) {
            const div = document.getElementById('gallery');
            const imgContainer = document.createElement('div');
            imgContainer.innerHTML = `
                <img src="${url}" class="w-full rounded-lg shadow-md cursor-pointer hover:opacity-80 transition">
                <button onclick="downloadImg('${url}')" class="text-xs text-blue-500 mt-2 block mx-auto">გადმოწერა</button>
            `;
            div.prepend(imgContainer);
        }

        async function downloadImg(url) {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "high-res-photo.jpg";
            link.click();
        }
    </script>
</body>
</html>
