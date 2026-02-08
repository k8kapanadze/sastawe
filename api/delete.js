const crypto = require('crypto');

export default async function handler(req, res) {
    // მხოლოდ POST მოთხოვნებს ვიღებთ
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { public_id } = JSON.parse(req.body);
        
        const cloudName = "djdz4uygc";
        const apiKey = "646963217153377"; 
        const apiSecret = "eZvCY12-BHkwvj9Ux_rOHGY98tA";
        const timestamp = Math.round(new Date().getTime() / 1000);

        // 1. ვქმნით ხელმოწერას (Signature), რომ Cloudinary-მ გვენდოს
        const signatureStr = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

        // 2. ვამზადებთ მონაცემებს გასაგზავნად
        const formData = new URLSearchParams();
        formData.append("public_id", public_id);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        // 3. ვუგზავნით მოთხოვნას Cloudinary-ს წაშლაზე
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        
        // ვუბრუნებთ პასუხს ჩვენს საიტს (index.html-ს)
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
